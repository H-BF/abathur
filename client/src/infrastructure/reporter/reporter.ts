import { REPORTER_HOST, REPORTER_PORT, REPORTER_PROTOCOL } from "../../../config";
import { MissEnvVariable } from "../../errors";
import { RestClient } from "../axios/rest-client";
import { IAssertionCreateReq, IAssertionsCreateRes } from "./interfaces/assertion-create.interface";

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

    async createAssertions(assertions: IAssertionCreateReq[]):Promise<number> {
        try {
            const { data } = await this.post<IAssertionsCreateRes>('/assertions', assertions)
            return Number(data.count)
        } catch (err) {
            throw new Error(`${err}`)
        }
    }
}