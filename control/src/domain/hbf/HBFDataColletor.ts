import { HBFClient, ISecurityGroup } from "../../infrastructure";
import { INetwork } from "../../infrastructure/hbf/interfaces/networks";
import { IRule } from "../../infrastructure/hbf/interfaces/rules";
import { IHBFData } from "./interfaces";

export class HBFDataCollector {

    private HBFClient: HBFClient
    private rules: IRule[] | undefined
    private sg: ISecurityGroup[] | undefined
    private networks: INetwork[] | undefined
    
    constructor() {
        this.HBFClient = new HBFClient()
    }

    async collect(): Promise<IHBFData[]> {
        this.sg = (await this.HBFClient.getSecurityGroups()).groups

        this.networks = (await this.HBFClient.getNetworks({
                neteworkNames: this.sg.flatMap(group => group.networks) 
            })
        ).networks

        this.rules = (await this.HBFClient.getRulesBetween({
                sgFrom: this.sg.map(group => group.name),
                sgTo: []
            })
        ).rules

        return this.transform()
    }

    private transform(): IHBFData[] {
        const results: IHBFData[] = []

        if (!this.rules) throw new Error("Rules is undefined")

        this.rules.forEach(rule => {
                results.push({
                    sgFrom: rule.sgFrom,
                    cidrFrom: this.getCIDRs(rule.sgFrom),
                    sgTo: rule.sgTo,
                    ciderTo: this.getCIDRs(rule.sgTo),
                    transport: rule.transport,
                    ports: rule.ports
                })
        })
        return results
    }

    private getCIDRs(sgName: string): string[] {
        if (!this.sg) throw new Error("SG is undefined")
    
        return this.sg
            .filter(sgItem => sgItem.name === sgName)
            .flatMap(item => {
                return item.networks.map(netName => {
                    if (!this.networks) throw new Error("networks is undefined")
                    return this.networks.find(networkItem => networkItem.name === netName)?.network.CIDR || ""
                })
            })
    }
}