import { logger } from "../logger/logger.service"
import { HBFDataCollector } from "./hbf-data-collector.abstract"
import { DirectionType, ITcpUdpTestData, PortsForServers, TestDataRecord } from "./interfaces"
import { IIpWithHBFAgent } from "./interfaces/ipWithHBFAgent"

export class S2CTcpUdpIEDataCollector extends HBFDataCollector {

    private testData: TestDataRecord = {}
    private serversPorts: PortsForServers = {}
    private ips: IIpWithHBFAgent[] = []

    constructor(
        protocol: string,
        host: string,
        port: string
    ) {
        super(protocol, host, port)
    }

    async collect(): Promise<void> {
        logger.info(`Получаем данные из БД hbf-server`)
        await super.collect()
        await this.collectS2CTcpUdpIERules()
    }

    convert(): void {
        logger.info('Выделяем тестовые данные для S2C IE TCP/UDP правил')

        if (!this.sgToCidrIETcpUdpRules)
            throw new Error("SG Rules is undefined")

        this.sgToCidrIETcpUdpRules.forEach(rule => {

            const sgIps = this.getIPs(rule.SG)
            const cidrIp = this.transformIECidrToIp(rule.CIDR)

            const from: string = rule.traffic == "Ingress" ? rule.CIDR : rule.SG
            const to: string = rule.traffic == "Ingress" ? rule.SG : rule.CIDR
            const ipsFrom: string[] = rule.traffic == "Ingress" ? cidrIp : sgIps
            const fromType: DirectionType = rule.traffic == "Ingress" ? DirectionType.CIDR : DirectionType.SG
            const ipsTo: string[] = rule.traffic == "Ingress" ? sgIps : cidrIp
            const toType: DirectionType = rule.traffic == "Ingress" ? DirectionType.SG : DirectionType.CIDR
            const ports = this.transformPorts(rule.ports)

            if (this.isNeedTo(ipsTo))
                return

            const data: ITcpUdpTestData = {
                from: from,
                to: to,
                fromType: fromType,
                toType: toType,
                transport: rule.transport,
                traffic: rule.traffic,
                dst: ipsTo,
                ports: ports
            }

            ipsFrom.forEach(ipFrom => {
                this.testData[ipFrom] = this.testData[ipFrom] ? [...this.testData[ipFrom], data] : [data]
            })

            ipsTo.forEach(ip => {
                if (!(ip in this.serversPorts)) {
                    this.serversPorts[ip] = { TCP: [], UDP: [] }
                }
                this.serversPorts[ip][rule.transport].push(...ports.map(item => item.dstPorts).flat())
            })

            sgIps.forEach(ip => {
                this.ips.push({
                    ip: ip,
                    haveAgent: true
                })
            })

            cidrIp.forEach(ip => {
                this.ips.push({
                    ip: ip,
                    haveAgent: false
                })
            })
        })
    }

    get() {
        return {
            testData: this.testData,
            serversPorts: this.serversPorts,
            ips: this.ips
        }
    }
}