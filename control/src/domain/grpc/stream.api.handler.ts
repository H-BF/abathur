import { Req } from "../../../gRPC/control/Req"
import { logger } from "../logger/logger.service";
import { Status } from '../../../gRPC/control/Status';
import { StreamHeandler } from "./stream.handler.abstract.class";

class StreamApiHandler extends StreamHeandler {

    private launchUuid!: string;
    private streamsList: Set<string> = new Set;
    
    stream(call: any) {

        const streamID = call.metadata.get("id")[0]
        this.streamsList.add(streamID)

        call.on("data", (request: Req) => {
            if(!request.status) 
                throw new Error('Обязательное поле status отсутствует')
            
            const status = this.getKeyByValue(request.status as number, Status)
            
            switch(status) {
                case 'ready':
                    logger.info("Попали в ветку ready")
                    call.write({ msg: this.launchUuid })
                    break
                case 'finish':
                    logger.info("Попали в ветку finish")
                    if(!request.data) 
                        throw new Error('Обязательное data отсутствует')
                    const { fail, pass } = JSON.parse(request.data)
                    this.passCount = pass
                    this.failCount = fail
                    break
                case 'error':
                    logger.info("Попали в ветку error")
                    if(!request.data) 
                        throw new Error('Обязательное data отсутствует')
                    throw new Error(request.data)
            }
        })

        call.on("end", () => {
            this.streamsList.delete(streamID)
            logger.info(`Стрим c завершен!`)
        })

        call.on("error", (err: any) => {
            logger.error(err)
        })
    }

    setLaunchUuid(launchUuid: string) {
        this.launchUuid = launchUuid
    }

    getStreamList(): Set<string> {
        return this.streamsList
    }
}

export const streamApiHandler = new StreamApiHandler()