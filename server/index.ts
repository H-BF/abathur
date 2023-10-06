import { logger } from './src/logger.service';
import { evalutePorts } from './src/helper';
import { server } from './src/server';
import fs from 'fs';

const path = './ports/ports.json'

try {
    if(!fs.existsSync(path)) {
        logger.info("Нет портов для поднятия сервера")
        throw new Error("FuckThePolice")
        process.exit(0)
    }

    const fileData = fs.readFileSync(path, 'utf-8')
    const ports: string[] = JSON.parse(fileData);

    (async () => {
        evalutePorts(ports).forEach(port => {
            server.start(Number(port))
        })
    })();
} catch(err) {
    logger.error(err)
}