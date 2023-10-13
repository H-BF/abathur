import { HBFClient, ISecurityGroup } from "../../infrastructure";
import { INetwork } from "../../infrastructure/hbf/interfaces/networks";
import { IRulePorts } from "../../infrastructure/hbf/interfaces/rules";
import { IToFqdnRule } from "../../infrastructure/hbf/interfaces/rules-to-fqdn";
import { IToSgRule } from "../../infrastructure/hbf/interfaces/rules-to-sg";
import { variables } from "../../infrastructure/var_storage/variables-storage";
import { logger } from "../logger/logger.service";
import { Networks } from "../networks";
import { IData, IHBFTestData, IPortForServer, IPorts } from "./interfaces";

export class HBFDataCollector {

    private HBFClient: HBFClient
    private toSgRules: IToSgRule[] | undefined
    private toFqdnRules: IToFqdnRule[] | undefined
    private sg: ISecurityGroup[] | undefined
    private networks: INetwork[] | undefined
    
    constructor() {
        this.HBFClient = new HBFClient()
    }

    async collect(): Promise<void> {
        logger.info(`Получаем данные из БД hbf-server`)
        logger.info(`Список SG`)
        this.sg = (await this.HBFClient.getSecurityGroups()).groups

        logger.info(`Список networks`)
        this.networks = (await this.HBFClient.getNetworks({
                neteworkNames: this.sg.flatMap(group => group.networks) 
            })
        ).networks

        logger.info(`Правила sg-to-sg`)
        this.toSgRules = (await this.HBFClient.getToSgRules({
                sgFrom: this.sg.map(group => group.name),
                sgTo: []
            })
        ).rules

        logger.info(`Правила sg-to-fqdn`)
        this.toFqdnRules = (await this.HBFClient.getToFqdnRules({
            sgFrom: this.sg.map(group  => group.name)
        })).rules
    }

    getTestData(): IHBFTestData {
        logger.info('выделяем тестовые данные из полученных от hbf-server')
        const results: IHBFTestData = {}

        if (!this.toSgRules) 
            throw new Error("SG Rules is undefined")

        if (!this.toFqdnRules) 
            throw new Error("FQDN Rules is undefined")  

        const toSgTestData: IHBFTestData = this.getTestDataFrom(this.toSgRules)
        const toFqdnTestData: IHBFTestData = this.getTestDataFrom(this.toFqdnRules);

        [...new Set(Object.keys(toSgTestData).concat(Object.keys(toFqdnTestData)))].forEach(key => {
            results[key] = (toSgTestData[key] || []).concat(toFqdnTestData[key] || [])
        })
        
        return results
    }

    gePortsForServer(): IPortForServer {
        logger.info('Получаем список портов, какие надо открыть на соответствующих подах')
        const result: IPortForServer = {} 

        if (!this.toSgRules) 
            throw new Error("SG Rules is undefined")

        if (!this.toFqdnRules) 
            throw new Error("FQDN Rules is undefined")
        
        const toSgPorts: IPortForServer = this.getPorts(this.toSgRules)
        const toFqdnPorts: IPortForServer = this.getPorts(this.toFqdnRules);

        [...new Set(Object.keys(toSgPorts).concat(Object.keys(toFqdnPorts)))].forEach(key => {
            result[key] = [...new Set((toSgPorts[key] || []).concat(toFqdnPorts[key] || []))]
        })

        return result
    }

    getFqdnList(): string[] {
        if (!this.toFqdnRules)
            throw new Error("FQDN Rules is undefined")

        return Array.from(new Set(this.toFqdnRules.map(e => e.FQDN)))
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

    private getTestDataFrom(rules: IToSgRule[] | IToFqdnRule[]): IHBFTestData {
        const results: IHBFTestData = {}
        rules.forEach(rule => {
            const ipsFrom = this.getIPs(rule.sgFrom)
            const to = (rule as IToSgRule).sgTo ? this.getIPs((rule as IToSgRule).sgTo) : [(rule as IToFqdnRule).FQDN]

            if (this.isNeedTo(to)) {
                return
            }

            const data: IData = {
                sgFrom: rule.sgFrom,
                to: (rule as IToSgRule).sgTo ?? (rule as IToFqdnRule).FQDN,
                transport: rule.transport,
                dst: to,
                ports: this.transformPorts(rule.ports)
            }

            ipsFrom.forEach(ipFrom => {
                results[ipFrom] = results[ipFrom] ? [...results[ipFrom], data] : [data]
            })
        })
        return results
    }

    private getPorts(rules: IToSgRule[] | IToFqdnRule[]): IPortForServer {
        const result: IPortForServer = {} 
        rules.forEach(rule => {
            const to = (rule as IToSgRule).sgTo ? this.getIPs((rule as IToSgRule).sgTo) : [(rule as IToFqdnRule).FQDN]
            const portsTo = this.transformPorts(rule.ports)

            if (this.isNeedTo(to)) {
                return
            }

            to.forEach(ip => {
                if (ip in result) {
                    result[ip] = result[ip].concat(portsTo.map(item => item.dstPorts).flat())
                } else {
                    result[ip] = portsTo.map(item => item.dstPorts).flat()
                }
            })
        })
        return result
    }
    
    private isNeedTo(to: string[]): boolean {
        return to.length === 1 && (to[0] === `${variables.get("HBF_REPORTER_IP")}` || to[0] === `${variables.get("ABA_CONTROL_IP")}`)
    }

    private getIPs(sg: string) {
        let ips: string[] = []
        this.getCIDRs(sg).forEach(cidr => {
            ips.push(...new Networks(cidr).getAddressesList())
        })
        return ips
    }

    private transformPorts(ports: IRulePorts[]): IPorts[] {
        let results: IPorts[] = []
        ports.forEach(port => {
            results.push({
                srcPorts: port.s.split(","),
                dstPorts: port.d.split(",")
            })
        })
        return results
    }
}