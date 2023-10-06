import express, { Request, Response, Express } from 'express';
import { logger } from './logger.service';

class Server {

    private app: Express

    constructor() {
        this.app = express()

        this.app.get('/check', (req: Request, res: Response) => {
            logger.info(`запрос пришел с ${req.socket.remoteAddress}:${req.socket.remotePort}`)
            res.send('OK')
        });
    }

    start(port: number) {
        this.app.listen(port, () => {
            logger.info(`Сервер запущен на порту ${port}`)
        })
    }
}

export const server = new Server()