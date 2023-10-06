import { Req } from "../../../gRPC/control/Req"
import { logger } from "../logger/logger.service";

class StreamApiHandler {

    private launchUuid!: string;
    private streamsList: Set<string> = new Set;
    private result! : { fail: number, pass: number }
    
    stream(call: any) {

        const streamID = call.metadata.get("id")[0]
        this.streamsList.add(streamID)

        call.on("data", (request: Req) => {
            if(!request.status) 
                throw new Error('Обязательное поле status отсутствует')
            
            switch(request.status) {
                case 1:
                    logger.info("Попали в ветку ready")
                    call.write({ msg: this.launchUuid })
                    break
                case 2:
                    logger.info("Попали в ветку finish")
                    if(!request.data) 
                        throw new Error('Обязательное data отсутствует')
                    this.result = JSON.parse(request.data) as { fail: number, pass: number }
                    break
                case 3:
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

    getResult(): { fail: number, pass: number } {
        return this.result
    }
}

export const streamApiHandler = new StreamApiHandler()