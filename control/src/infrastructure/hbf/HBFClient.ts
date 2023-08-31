import { RestClient } from "../axios";
import { HBF_HOST, HBF_PORT, HBF_PROTOCOL } from "../../../config/hbf_conf";
import { ISecurityGroups, ISecurityGroupsReq } from "./interfaces/securityGroups";
import { INetworks, INetworksReq } from "./interfaces/networks";
import { IRules, IRulesReq } from "./interfaces/rules";

export class HBFClient extends RestClient {

    constructor() {
        console.log(`Создаем REST-client для: ${HBF_HOST}`)
        super(HBF_HOST,HBF_PORT,HBF_PROTOCOL)
        this.defaults.baseURL += "/v1"
    }
    
    async getSecurityGroups(sgNames: ISecurityGroupsReq = {}): Promise<ISecurityGroups> {
        const { data } = await this.post<ISecurityGroups>('/list/security-groups', sgNames)
        return data
    }

    async getNetworks(networkNames: INetworksReq = {}): Promise<INetworks> {
        const { data } = await this.post<INetworks>('/list/networks', networkNames)
        return data
    }

    async getRulesBetween(route: IRulesReq): Promise<IRules> {
        const { data } = await this.post<IRules>('/rules', route)
        return data
    }
}