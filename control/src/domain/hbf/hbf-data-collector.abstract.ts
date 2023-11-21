import { HBFClient, ISecurityGroup } from "../../infrastructure";
import { INetwork } from "../../infrastructure/hbf/interfaces/networks";
import { IRulePorts } from "../../infrastructure/hbf/interfaces/rules";
import { ISgIcmpRule } from "../../infrastructure/hbf/interfaces/rules-sg-icmp";
import { ISgToFqdnRule } from "../../infrastructure/hbf/interfaces/rules-sg-to-fqdn";
import { ISgToSgRule } from "../../infrastructure/hbf/interfaces/rules-sg-to-sg";
import { ISgToSgIcmpRule } from "../../infrastructure/hbf/interfaces/rules-sg-to-sg-icmp";
import { variables } from "../../infrastructure/var_storage/variables-storage";
import { logger } from "../logger/logger.service";
import { Networks } from "../networks";
import { IPorts } from "./interfaces";
import { IHBFDataCollector } from "./interfaces/hbf-data-collector.interface";

export abstract class HBFDataCollector implements IHBFDataCollector {

    private HBFClient: HBFClient
    protected sg: ISecurityGroup[] | undefined
    protected networks: INetwork[] | undefined

    protected sgToSgRules: ISgToSgRule[] | undefined
    protected sgToFqdnRules: ISgToFqdnRule[] | undefined
    protected sgIcmpRules: ISgIcmpRule[] | undefined
    protected sgToSgIcmpRules: ISgToSgIcmpRule[] | undefined
    
    constructor(
        protocol: string,
        host: string,
        port: string
    ) {
        this.HBFClient = new HBFClient(protocol,host,port)
    }

    async collect(): Promise<void> {
        logger.info(`Список SG`)
        this.sg = (await this.HBFClient.getSecurityGroups()).groups

        logger.info(`Список networks`)
        this.networks = (await this.HBFClient.getNetworks({
                neteworkNames: this.sg.flatMap(group => group.networks) 
            })
        ).networks
    }

    abstract convert(): void

    abstract get(): any

    //////////////////////

    protected async collectS2STcpUdpRules() {
        logger.info(`Правила sg-to-sg`)

        if (!this.sg) 
            throw new Error("SG is undefined")

        this.sgToSgRules = (await this.HBFClient.getSgToSgRules({
                sgFrom: this.sg.map(group => group.name),
                sgTo: []
            })
        ).rules
    }

    protected async collectS2FTcpUdpRules() {
        logger.info(`Правила sg-to-fqdn`)

        if (!this.sg) 
            throw new Error("SG is undefined")

        this.sgToFqdnRules = (await this.HBFClient.getToFqdnRules({
            sgFrom: this.sg.map(group  => group.name)
        })).rules
    }

    protected async collectS2SIcmpRules() {
        logger.info(`Правила sg-sg-icmp`)

        if (!this.sg) 
            throw new Error("SG is undefined")

        this.sgToSgIcmpRules = (await this.HBFClient.getSgToSgIcmpRules({
            sgFrom: this.sg.map(group  => group.name),
            sgTo: []
        })).rules
    }

    protected async collectSgIcmpRules() {
        logger.info(`Правила sg-icmp`)

        if (!this.sg) 
            throw new Error("SG is undefined")

        this.sgIcmpRules = (await this.HBFClient.getSgIcmpRules({
            sg: this.sg.map(group  => group.name)
        })).rules
    }

    ////////////////////
    
    protected isNeedTo(to: string[]): boolean {
        return to.length === 1 && (to[0] === `${variables.get("HBF_REPORTER_IP")}` || to[0] === `${variables.get("ABA_CONTROL_IP")}`)
    }

    protected getIPs(sg: string) {
        let ips: string[] = []
        this.getCIDRs(sg).forEach(cidr => {
            ips.push(...new Networks(cidr).getAddressesList())
        })
        return ips
    }

    protected transformPorts(ports: IRulePorts[]): IPorts[] {
        let results: IPorts[] = []
        ports.forEach(port => {
            results.push({
                srcPorts: port.s.split(","),
                dstPorts: port.d.split(",")
            })
        })
        return results 
    }

    protected transformTypes(types: number[]): string[] {
        if(types.length === 0)
            return ['all']
        return types.map(type => type.toString())
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