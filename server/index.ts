import { logger } from './src/logger.service';
import { evalutePorts } from './src/helper';
import { tcpServer } from './src/tcpServer';
import { IPorts } from './src/ports.interface';
import { udpServer } from './src/udpServer';
import fs from 'fs';

const path = './ports/ports.json'

try {
    if(!fs.existsSync(path)) {
        logger.info("Нет портов для поднятия сервера")
        process.exit(0)
    }

    const fileData = fs.readFileSync(path, 'utf-8')
    const ports: IPorts = JSON.parse(fileData);

    (async () => {
        if(ports.TCP != undefined && ports.TCP.length != 0) {
            evalutePorts(ports.TCP).forEach(port => {
                tcpServer.start(Number(port))
            })
        }
        if(ports.UDP != undefined && ports.UDP.length != 0) {
            evalutePorts(ports.UDP).forEach( port => {
                udpServer.start(Number(port))
            })
        }
    })();
} catch(err) {
    logger.error(err)
    process.exit(0)
}