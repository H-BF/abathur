import dgram, {Socket} from 'node:dgram';
import { logger } from '../../domain/logger/logger.service';
import { ISocketClient } from './socket.client.interface';

export class UDPSocketClient implements ISocketClient {

    private socket: Socket
    private msg: string = 'check'
    private timeout: number = 3000

    constructor() {
        this.socket = dgram.createSocket('udp4')
    }

    async check(
        srcPort: number,
        dstIp: string,
        dstPort: number
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.socket.bind(srcPort)

            this.socket.send(this.msg, dstPort, dstIp, err => {
                if(err) {
                    reject(new Error(`[UDP] ${err}`))
                }
                
                logger.info(`[UDP] Отправлено сообщение '${this.msg}' на ${dstIp}:${dstPort}`)
            })

            const timer = setTimeout(() => {
                logger.info(`Connection timed out!`)
                this.socket.close()
                reject(new Error(`[UDP] Connection timed out!`))
            }, this.timeout)

            this.socket.on('message', (msg, rinfo) => {
                logger.info(`[UDP] Клиент получил ACK сообщение от ${rinfo.address}:${rinfo.port}: ${msg}`)
                clearTimeout(timer)
                this.socket.close()
                resolve(msg.toString())
            })

            this.socket.on('error', (err) => {
                this.socket.close()
                reject(err)
            })
        })
    }
}