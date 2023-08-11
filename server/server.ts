import express, { Request, Response } from 'express';
import fs from 'fs'

const path = './ports/ports.json'

if(!fs.existsSync(path)) {
    console.log("Нет портов для поднятия сервера")
    process.exit(0)
}

const ports: string[] = JSON.parse(fs.readFileSync(path, 'utf-8'))

const app = express()

function evalutePorts(ports: string[]): string[] {
    return ports.flatMap((port) => {
        if (port.includes("-")) {
        const [start, end] = port.split("-");
        return Array.from({ length: Number(end) - Number(start) + 1 }, (_, i) =>
            (Number(start) + i).toString()
        );
        } else {
            return [port];
        }
    });
}

function start(port: number) {
    app.listen(port, () => {
        console.log(`Сервер запущен на порту ${port}`)
    })
}

app.get('/check', (req: Request, res: Response) => {
    console.log(`src: ${req.socket.remoteAddress}:${req.socket.remotePort}`)
    res.send('OK')
});

(async () => {
    evalutePorts(ports).forEach(port => {
        start(Number(port))
    })
})();