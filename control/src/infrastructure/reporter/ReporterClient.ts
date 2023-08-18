import { MissEnvVariable } from "../../domain/errors";
import { RestClient } from "../axios";
import { ICreateLaunchErrorReq, ICreateLaunchReq, ICreateLaunchRes, IUpdateLaunchReq, IUpdateLaunchRes } from "./interfaces";

export class ReporterClient extends RestClient {
   
    constructor() {

        if (!process.env.REPORTER_HOST)
            throw new MissEnvVariable('REPORTER_HOST')

        if (!process.env.REPORTER_PORT)
            throw new MissEnvVariable('REPORTER_PORT')

        if (!process.env.REPORTER_PROTOCOL)
            throw new MissEnvVariable('REPORTER_PROTOCOL')

        super(
            process.env.REPORTER_HOST,
            process.env.REPORTER_PORT,
            process.env.REPORTER_PROTOCOL,
        )
        this.defaults.baseURL += '/v1'
    }

    async createLaunch(launch: ICreateLaunchReq): Promise<string> {
        try {
            const { data } = await this.post<ICreateLaunchRes>('/launch', launch)
            return data.uuid
        } catch (err: any) {
            const data = err.response.data
            throw new Error(`${data.title}\n${data.msg}`)
        }
    }

    async updateLaunch(launch: IUpdateLaunchReq): Promise<IUpdateLaunchRes> {
        try {
            const { data } = await this.patch<IUpdateLaunchRes>('/launch', launch)
            return data
        } catch(err: any) {
            const data = err.response.data
            throw new Error(`${data.title}\n${data.msg}`)
        }
    }

    async createLaunchError(launchError: ICreateLaunchErrorReq) {
        try {
            await this.post('/launch_error', launchError)
        } catch (err: any) {
            const data = err.response.data
            throw new Error(`${data.title}\n${data.msg}`)
        }
    }
}