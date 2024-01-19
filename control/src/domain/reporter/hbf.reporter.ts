import { HBFReporterClient } from "../../infrastructure/reporter"
import { ICreateLaunchReq } from "../../infrastructure/reporter/interfaces/create-launch.interface"
import { LaunchStatus } from "../../infrastructure/reporter/interfaces/update-launch.interface"
import { logger } from "../logger/logger.service"

export class HBFReporter {

    private client: HBFReporterClient
    private _launchUUID?: string

    constructor() {
        this.client = new HBFReporterClient()
    }

    get launchUUID(): string {
        if (!this._launchUUID)
            throw new Error("Launch not create yet")
        return this._launchUUID
    }

    async createLaunch(
        pipeline: string,
        job: string,
        srcBranch: string,
        commit: string,
        tag: string,
        serviceName: string,
        context: string
    ): Promise<void> {
        const launch: ICreateLaunchReq = { 
            pipeline: parseInt(pipeline),
            job: parseInt(job),
            srcBranch: srcBranch,
            commit: commit,
            tag: tag,
            serviceName: serviceName
        }
        logger.info(`[${context.toUpperCase()}] Создаем лаунч!`)
        this._launchUUID = await this.client.createLaunch(launch)
        logger.info(`[${context.toUpperCase()}] Лаунч создан! ${this._launchUUID}`)
    }

    async setStauts(status: LaunchStatus) {
        logger.info(`Устонавливаем в БД статус для Launch ${this._launchUUID}: ${status}`)
        if (!this._launchUUID)
            throw new Error("Launch not create yet")

        await this.client.updateLaunch({
            uuid: this._launchUUID,
            status: status 
        })
    }

    async closeLaunch(fail: number, pass: number, duration: number) {
        logger.info(`Закрываем лаунч ${this._launchUUID}`)
        if (!this._launchUUID)
            throw new Error("Launch not create yet")

        await this.client.updateLaunch({
            uuid: this._launchUUID,
            failCount: fail,
            passCount: pass,
            duration: duration,
            status: LaunchStatus.FINISH
        })
    }

    async closeLaunchWithError(errMsg: string) {
        logger.error(errMsg)
        if (!this._launchUUID)
            throw new Error("Launch not create yet")

        await this.client.createLaunchError({
            launch_uuid: this._launchUUID,
            message: errMsg
        })
        await this.setStauts(LaunchStatus.ERROR)
    }
}
