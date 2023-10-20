import { IStreamSimpleFuncList, ITestPodClientCount } from './interfaces/simple.func.interfaces';
import { Req } from '../../../gRPC/control/Req'
import { logger } from '../logger/logger.service';
import { SimpleFuncType } from './enums/simple.func.types';
import { Status } from '../../../gRPC/control/Status';

class StreamSimpleFuncHandler {

    private streamsList: IStreamSimpleFuncList = {
        s2s: new Set(),
        s2f: new Set(),
        s2c: new Set(),
        c2s: new Set()
    };
    private clientPodNumbers: ITestPodClientCount = {
        s2s: 0,
        s2f: 0,
        s2c: 0,
        c2s: 0
    };
    private launchUuid!: string;
    passCount: number = 0
    failCount: number = 0

    stream(call: any) {

        const streamID = call.metadata.get("id")[0]
        const simpleFuncType = call.metadata.get("type")[0] as SimpleFuncType

        this.streamsList[simpleFuncType].add(streamID)

        logger.info(`Начат стрим ${streamID}`)

        call.on("data", (request: Req) => {
            if(!request.status) 
                throw new Error('Обязательное поле status отсутствует')
            
            const status = this.getKeyByValue(request.status as number, Status)
            
            switch(status) {
                case 'ready':
                    logger.info("Попали в ветку ready") 
                    const interval = setInterval(() => {
                        if (this.streamsList[simpleFuncType].size == this.clientPodNumbers[simpleFuncType]) {
                            clearInterval(interval)
                            call.write({ msg: this.launchUuid })
                        }
                    })
                    break;
                case 'finish':
                    logger.info("Попали в ветку finish")
                    if(!request.data) 
                        throw new Error('Обязательное data status отсутствует')
                    const data = JSON.parse(request.data) as { fail: number, pass: number }
                    this.passCount += data.pass
                    this.failCount += data.fail
                    break;
                case 'error':
                    logger.info("Попали в ветку finish")
                    if(!request.data) 
                        throw new Error('Обязательное data отсутствует')
                    throw new Error(request.data)
            } 
        })

        call.on("end", () => {
            this.streamsList[simpleFuncType].delete(streamID)
            logger.info(`Стрим c ${streamID} завершен!`)
        })
        
        call.on("error", (err: any) => {
            logger.error(err)
        })
    }

    setLaunchUUID(launchUuid: string) {
        this.launchUuid = launchUuid
    }

    setClientPodsNumber(
        type: SimpleFuncType,
        clientPodsNumber: number
    ) {
        this.clientPodNumbers[type] = clientPodsNumber
    }

    getStreamList(type: SimpleFuncType): Set<string> {
        return this.streamsList[type]
    }

    private getKeyByValue(value: number, enumObject: any): string | undefined {
        return Object.keys(enumObject).find(key => enumObject[key] === value);
    }
}

export const streamSimpleFuncHandler = new StreamSimpleFuncHandler()