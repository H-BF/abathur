import { RestClient } from "../axios";
import { ISecurityGroups, ISecurityGroupsReq } from "./interfaces/securityGroups";
import { INetworks, INetworksReq } from "./interfaces/networks";
import { ISgToSgRules, ISgToSgRulesReq } from "./interfaces/rules-sg-to-sg";
import { logger } from "../../domain/logger/logger.service";
import { ISgToFqdnRules, ISgToFqdnRulesReq } from "./interfaces/rules-sg-to-fqdn";
import { retry } from "../../domain/decorator/retry.decorator";
import { ISgIcmpRules, ISgIcmpRulesReq } from "./interfaces/rules-sg-icmp";
import { ISgToSgIcmpRules, ISgToSgIcmpRulesReq } from "./interfaces/rules-sg-to-sg-icmp";
import { ISgToCidrIERules, ISgToCidrIERulesReq } from "./interfaces/rules-sg-cidr-ie";

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
    async getSgToSgRules(route: ISgToSgRulesReq): Promise<ISgToSgRules> {
        const { data } = await this.post<ISgToSgRules>('/rules', route)
        return data
    }

    @retry()
    async getToFqdnRules(route: ISgToFqdnRulesReq): Promise<ISgToFqdnRules> {
        const { data } = await this.post<ISgToFqdnRules>('/fqdn/rules', route)
        return data
    }

    @retry()
    async getSgIcmpRules(route: ISgIcmpRulesReq): Promise<ISgIcmpRules> {
        const { data } = await this.post<ISgIcmpRules>('/sg-icmp/rules', route)
        return data
    }

    @retry()
    async getSgToSgIcmpRules(route: ISgToSgIcmpRulesReq): Promise<ISgToSgIcmpRules> {
        const { data } = await this.post<ISgToSgIcmpRules>('/sg-sg-icmp/rules', route)
        return data
    }

    @retry()
    async getSgToCidrIERules(route: ISgToCidrIERulesReq): Promise<ISgToCidrIERules> {
        const { data } = await this.post<ISgToCidrIERules>('/cird-sg/rules', route)
        return data
    }
}