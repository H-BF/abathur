import { ReporterClient } from "../../infrastructure/reporter"
import { ICreateLaunchReq } from "../../infrastructure/reporter/interfaces/create-launch.interface"
import { LaunchStatus } from "../../infrastructure/reporter/interfaces/update-launch.interface"

export class Reporter {

    private client: ReporterClient
    private _launchUUID?: string

    constructor() {
        this.client = new ReporterClient()
    }

    get launchUUID(): string {
        if (!this._launchUUID)
            throw new Error("Launch not create yet")
        return this._launchUUID
    }

    async createLaunch(pipeline: string, job: string): Promise<void> {
        const launch: ICreateLaunchReq = { pipeline: parseInt(pipeline), job: parseInt(job) }
        this._launchUUID = await this.client.createLaunch(launch)
    }

    async setStauts(status: LaunchStatus) {
        if (!this._launchUUID)
            throw new Error("Launch not create yet")

        await this.client.updateLaunch({
            uuid: this._launchUUID,
            status: status 
        })
    }

    async closeLaunch(fail: number, pass: number, duration: number) {
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
        if (!this._launchUUID)
            throw new Error("Launch not create yet")

        await this.client.createLaunchError({
            launch_uuid: this._launchUUID,
            message: errMsg
        })
        await this.setStauts(LaunchStatus.ERROR)
    }
}