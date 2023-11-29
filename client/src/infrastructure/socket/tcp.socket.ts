import net from 'net';
import { logger } from '../../domain/logger/logger.service';
import { ISocketClient } from './socket.client.interface';

export class TCPSocketClient implements ISocketClient {
    private socket: net.Socket
    private request: string = `GET /check HTTP/2.0\r\nHost: localhost\r\n\r\n`;

    constructor() {
        this.socket = new net.Socket();
    }

    async check(
        srcPort: number,
        dstIp: string,
        dstPort: number
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.socket.connect({
                host: dstIp,
                port: dstPort,
                localPort: srcPort
            })

            this.socket.setTimeout(2000)

            this.socket.write(this.request, () => {
                logger.info(`[TCP] Отправлено сообщение на ${dstIp}:${dstPort}`)
            })
            
            this.socket.on('data', (data) => {
                this.socket.destroy()
                resolve(data.toString())
            })

            this.socket.on('error', (error) => {
                this.socket.destroy()
                reject(error)
            })

            this.socket.on('timeout', () => {
                logger.info('Connection timed out!')
                this.socket.destroy();
                reject(new Error('Connection timed out'));
            })
        })
    }
}