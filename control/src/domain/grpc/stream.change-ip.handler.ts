import { variables } from '../../infrastructure/var_storage/variables-storage';
import { StreamHeandler } from './stream.handler.abstract.class'
import { Status } from '../../../gRPC/control/Status';
import { logger } from '../logger/logger.service';
import { Req } from '../../../gRPC/control/Req'
import { Phase } from './enums/change-ip.phase';

class StreamChangeIpHandler extends StreamHeandler {

    phase!: Phase

    passCount: number = 0
    failCount: number = 0

    stream(call: any) {

        call.on("data", async (request: Req) => {
            if(!request.status) 
                throw new Error('Обязательное поле status отсутствует')

            const status = this.getKeyByValue(request.status as number, Status)

            switch(status) {
                case "ready":
                    this.phase = Phase.START_ONE
                    const msg = variables.get("FUNC_LAUNCH_UUID")
                    logger.debug(`отправляем сообщение: ${msg}`)
                    call.write({ msg: msg })
                    break;
                case "next":
                    this.phase = Phase.FINISH_ONE
                    await this.waitPhaseIs(Phase.START_TWO)
                    logger.debug(`отправляем сообщение: start`)
                    call.write({ msg: "start" })
                    break;
                case "finish":
                    if(!request.data) 
                        throw new Error('Обязательное поле data отсутствует')
                    this.phase = Phase.FINISH_TWO
                    const { fail, pass } = JSON.parse(request.data)
                    this.failCount = fail
                    this.passCount = pass
                    break;
                case "error":
                    if(!request.data) 
                        throw new Error('Обязательное поле data отсутствует')
                    throw new Error(request.data)
            }
        })

        call.on("end", () => {
            logger.info(`Стрим changeIP завершен!`)
            this.phase = Phase.FINISH_ALL
        })

        call.on("error", (err: any) => {
            logger.error(err)
        })
    }

    async waitPhaseIs(
        phase: Phase,
        timeout: number = 300000,
        frequency: number = 1000
    ): Promise<void> {
        logger.info(`Ждем фазу: ${phase}`)
        return new Promise((resolve, reject) => {
            const startTime = Date.now()
            const interval = setInterval(() => {
                if (this.phase === phase) {
                    clearInterval(interval)
                    resolve()
                } else if (Date.now() - startTime >= timeout) {
                    clearInterval(interval)
                    reject(new Error(`Фаза не сменилась за отведеное время. Ожидаемое значение: ${phase}, текущиее: ${this.phase}`))
                }
            }, frequency)
        })
    }
}

export const streamChangeIpHandler = new StreamChangeIpHandler()