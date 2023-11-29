import dgram, { Socket,RemoteInfo } from 'node:dgram';
import { logger } from './logger.service';

class UDPServer {

    start(port: number) {
        const socket = dgram.createSocket('udp4')
        this.createSocketHandler(socket)
        socket.bind(port, () => {
            logger.info(`[UDP] сокет слушает порт ${port}`)
        })
    }

    private createSocketHandler(socket: Socket) {
        socket.on('message', (msg: Buffer, rinfo: RemoteInfo) => {
            const src = `${rinfo.address}:${rinfo.port}`
            
            logger.info(`[UDP] сервер получил сообщение от ${src}: ${msg}`)
        
            socket.send('ACK', rinfo.port, rinfo.address, (err: Error | null) => {
                if(err) {
                    logger.error(`[UDP] Ошибка при отправке ACK сообщения для ${src}`)
                } else {
                    logger.info(`[UDP] Сервер отправил ACK сообщение для ${src}`);
                }
            })
        });

        socket.on("error", (err: Error, rinfo: RemoteInfo) => {
            const src = `${rinfo.address}:${rinfo.port}`
            console.log(`[UDP] Ошиба при работе c ${src}\n${err}`)
        })
    }
}

export const udpServer = new UDPServer()