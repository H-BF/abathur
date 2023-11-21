import { StreamHeandler } from "./stream.handler.abstract.class";
import { Status } from '../../../gRPC/control/Status';
import { Req } from '../../../gRPC/control/Req'
import { logger } from "../logger/logger.service";
import { variables } from "../../infrastructure/var_storage/variables-storage";


class StreamIcmpHandler extends StreamHeandler {

    private streamList: Set<string> = new Set<string>
    private podNumbers: number | undefined
    fail: number = 0
    pass: number = 0

    stream(call: any) {
        
        const streamID = call.metadata.get('id')[0]
        this.streamList.add(streamID)

        logger.info(`Начат стрим ${streamID}`)

        call.on('data', (request: Req) => {
            const status = this.getKeyByValue(request.status as number, Status)

            switch(status) {
                case 'ready':
                    logger.info("Попали в ветку ready")
                    const interval = setInterval(() => {
                        if (this.streamList.size == this.podNumbers) {
                            clearInterval(interval)
                            call.write({ msg: variables.get("FUNC_LAUNCH_UUID") })
                        }
                    })
                    break;
                case 'finish':
                    logger.info("Попали в ветку finish")
                    if(!request.data) 
                        throw new Error('Обязательное data status отсутствует')
                        const data = JSON.parse(request.data) as { fail: number, pass: number }
                    this.fail += data.fail
                    this.pass += data.pass
                    break;
                case 'error':
                    logger.info("Попали в ветку error")
                    if(!request.data) 
                        throw new Error('Обязательное data отсутствует')
                    throw new Error(request.data)
            }
        })

        call.on("end", () => {
            this.streamList.delete(streamID)
            logger.info(`Стрим c ${streamID} завершен!`)
        })

        call.on("error", (err: any) => {
            logger.error(err)
        })
    }

    setPodNumbers(podNumbers: number) {
        this.podNumbers = podNumbers
    }

    getStreamList(): Set<string> {
        return this.streamList
    }
}

export const streamIcmpHandler = new StreamIcmpHandler()