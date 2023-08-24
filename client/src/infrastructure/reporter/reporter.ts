import { RestClient } from "../axios/rest-client";
import { variables } from "../var_storage/variables-storage";
import { IAssertionCreateReq, IAssertionsCreateRes } from "./interfaces/assertion-create.interface";

export class ReporterClient extends RestClient {

    constructor() {        
        super(
            variables.get("REPORTER_HOST"),
            variables.get("REPORTER_PORT"),
            variables.get("REPORTER_PROTOCOL"),
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