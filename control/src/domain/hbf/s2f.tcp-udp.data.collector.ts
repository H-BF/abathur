import { logger } from "../logger/logger.service";
import { HBFDataCollector } from "./hbf-data-collector.abstract";
import { DirectionType, ITcpUdpTestData, TestDataRecord, PortsForServers } from "./interfaces";

export class S2FTcpUdpDataCollector extends HBFDataCollector {

    private testData: TestDataRecord = {}
    private serversPorts: PortsForServers = {}
    private fqdn: string[] = []

    constructor(
        protocol: string,
        host: string,
        port: string
    ) {
        super(protocol, host, port)
    }

    async collect() {
        logger.info(`Получаем данные из БД hbf-server`)
        await super.collect()
        await this.collectS2FTcpUdpRules()
    }

    convert() {
        logger.info('Выделяем тестовые данные для S2F TCP/UDP правил')

        if (!this.sgToFqdnRules) 
            throw new Error("FQDN Rules is undefined")

        this.sgToFqdnRules.forEach( rule => {

            const ipsFrom = this.getIPs(rule.sgFrom)
            const ports = this.transformPorts(rule.ports)

            if (this.isNeedTo([rule.FQDN])) {
                return
            }

            const data: ITcpUdpTestData = {
                from: rule.sgFrom,
                to: rule.FQDN,
                fromType: DirectionType.SG,
                toType: DirectionType.FQDN,
                transport: rule.transport,
                dst: [rule.FQDN],
                ports: ports
            }

            ipsFrom.forEach(ipFrom => {
                this.testData[ipFrom] = this.testData[ipFrom] ? [...this.testData[ipFrom], data] : [data]
            })

            if(!(rule.FQDN in this.serversPorts)) {
                this.serversPorts[rule.FQDN] = { TCP: [], UDP: [] }
            }

            this.serversPorts[rule.FQDN][rule.transport].push(...ports.map(item => item.dstPorts).flat())
        })

        this.fqdn = this.getFqdnList()
    }

    get() {
        return {
            testData: this.testData,
            serverPorts: this.serversPorts,
            fqdn: this.fqdn
        }
    }

    private getFqdnList(): string[] {
        if (!this.sgToFqdnRules)
            throw new Error("FQDN Rules is undefined")

        return Array.from(new Set(this.sgToFqdnRules.map(e => e.FQDN)))
    }
}