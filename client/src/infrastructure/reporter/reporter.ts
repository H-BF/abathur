import { logger } from "../../domain/logger/logger.service";
import { RestClient } from "../axios/rest-client";
import { variables } from "../var_storage/variables-storage";
import { IAssertionsCreateRes, IIcmpAssertionCreateReq, ITcpUdpAssertionCreateReq } from "./interfaces/assertion-create.interface";

export class ReporterClient extends RestClient {

    constructor() {        
        super(
            variables.get("ABA_CONTROL_IP"),    
            variables.get("ABA_CONTORL_PROXY_PORT"),
            variables.get("ABA_CONTORL_PROXY_PROTOCOL"),
        )
        this.defaults.baseURL += '/hbf/v1'
    }

    async createAssertions(
        assertions: ITcpUdpAssertionCreateReq[] | IIcmpAssertionCreateReq[]
    ):Promise<number> {
        try {
            const { data } = await this.post<IAssertionsCreateRes>('/assertions', assertions, {
                headers: {
                    'x-type': 'func'
                }
            })
            return Number(data.count)
        } catch (err) {
            logger.error(err)
            throw new Error(`${err}`)
        }
    }
}
