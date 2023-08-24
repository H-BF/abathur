import { RestClient } from "../axios";
import { variables } from "../var_storage/variables-storage";
import { ICreateLaunchErrorReq, ICreateLaunchReq, ICreateLaunchRes, IUpdateLaunchReq, IUpdateLaunchRes } from "./interfaces";

export class ReporterClient extends RestClient {
   
    constructor() {
        super(
            variables.get("REPORTER_HOST"),
            variables.get("REPORTER_PORT"),
            variables.get("REPORTER_PROTOCOL"),
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