import { RestClient } from "../axios";
import { ISecurityGroups, ISecurityGroupsReq } from "./interfaces/securityGroups";
import { INetworks, INetworksReq } from "./interfaces/networks";
import { IToSgRules, IToSgRulesReq } from "./interfaces/rules-to-sg";
import { logger } from "../../domain/logger/logger.service";
import { IToFqdnRules, IToFqdnRulesReq } from "./interfaces/rules-to-fqdn";
import { retry } from "../../domain/decorator/retry.decorator";

export class HBFClient extends RestClient {

    constructor(
        protocol: string,
        host: string,
        port: string
    ) {
        logger.info(`Создаем REST-client для: ${host}`)
        super(host,port,protocol)
        this.defaults.baseURL += "/v1"
    }
    
    @retry()
    async getSecurityGroups(sgNames: ISecurityGroupsReq = {}): Promise<ISecurityGroups> {
        const { data } = await this.post<ISecurityGroups>('/list/security-groups', sgNames)
        return data
    }

    @retry()
    async getNetworks(networkNames: INetworksReq = {}): Promise<INetworks> {
        const { data } = await this.post<INetworks>('/list/networks', networkNames)
        return data
    }

    @retry()
    async getToSgRules(route: IToSgRulesReq): Promise<IToSgRules> {
        const { data } = await this.post<IToSgRules>('/rules', route)
        return data
    }

    @retry()
    async getToFqdnRules(route: IToFqdnRulesReq): Promise<IToFqdnRules> {
        const { data } = await this.post<IToFqdnRules>('/fqdn/rules', route)
        return data
    }
}