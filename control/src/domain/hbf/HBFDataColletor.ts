import { HBFClient, ISecurityGroup } from "../../infrastructure";
import { INetwork } from "../../infrastructure/hbf/interfaces/networks";
import { IRule, IRulePorts } from "../../infrastructure/hbf/interfaces/rules";
import { variables } from "../../infrastructure/var_storage/variables-storage";
import { Networks } from "../networks";
import { IData, IHBFTestData, IPortForServer, IPorts } from "./interfaces";

export class HBFDataCollector {

    private HBFClient: HBFClient
    private rules: IRule[] | undefined
    private sg: ISecurityGroup[] | undefined
    private networks: INetwork[] | undefined
    
    constructor() {
        this.HBFClient = new HBFClient()
    }

    async collect(): Promise<void> {
        console.log(`Получаем данные из БД hbf-server`)
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
    }

    getTestData(): IHBFTestData {
        console.log('выделяем тестовые данные из полученных от hbf-server')
        const results: IHBFTestData = {}

        if (!this.rules) throw new Error("Rules is undefined")

        this.rules.forEach(rule => {
            const ipsFrom = this.getIPs(rule.sgFrom) 
            const ipsTo = this.getIPs(rule.sgTo)

            if (ipsTo.length === 1 && (ipsTo[0] === `${variables.get("REPORTER_HOST")}` || ipsTo[0] === "29.64.0.231")) {
                return
            }

            const data: IData = {
                sgFrom: rule.sgFrom,
                sgTo: rule.sgTo,
                transport: rule.transport,
                dstIps: ipsTo,
                ports: this.transformPorts(rule.ports)
            }

            ipsFrom.forEach(ipFrom => {
                results[ipFrom] = results[ipFrom] ? [...results[ipFrom], data] : [data]
            })
        })
        return results
    }

    gePortsForServer(): IPortForServer {
        console.log('Получаем список портов, какие надо открыть на соответствующих подах')
        const result: IPortForServer = {} 

        if (!this.rules) throw new Error("Rules is undefined")
        
        this.rules.forEach(rule => {
            const ipsTo = this.getIPs(rule.sgTo)
            const portsTo = this.transformPorts(rule.ports)

            if (ipsTo.length === 1 && (ipsTo[0] === "10.150.0.230" || ipsTo[0] === "10.150.0.231")) {
                return
            }

            ipsTo.forEach(ip => {
                if (ip in result) {
                    result[ip] = result[ip].concat(portsTo.map(item => item.dstPorts).flat())
                } else {
                    result[ip] = portsTo.map(item => item.dstPorts).flat()
                }
            })
        })

        return result
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