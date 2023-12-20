import { HBFDataCollector } from "./hbf-data-collector.abstract";
import { logger } from "../logger/logger.service";
import { DirectionType, ITcpUdpTestData, TestDataRecord, PortsForServers } from "./interfaces";

export class S2STcpUdpDataCollector extends HBFDataCollector {

    private testData: TestDataRecord = {}
    private serversPorts: PortsForServers = {}

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
        await this.collectS2STcpUdpRules()
    }

    convert() {
        logger.info('Выделяем тестовые данные для S2S TCP/UDP правил')

        if (!this.sgToSgRules) 
            throw new Error("SG Rules is undefined")
        
        this.sgToSgRules.forEach( rule => {

            const ipsFrom = this.getIPs(rule.sgFrom)
            const ipsTo = this.getIPs(rule.sgTo)
            const ports = this.transformPorts(rule.ports)

            if(this.isNeedTo(ipsTo))
                return

            const data: ITcpUdpTestData = {
                from: rule.sgFrom,
                to: rule.sgTo,
                fromType: DirectionType.SG,
                toType: DirectionType.SG,
                transport: rule.transport,
                traffic: 'unknown',
                dst: ipsTo,
                ports: ports
            }

            ipsFrom.forEach(ipFrom => {
                this.testData[ipFrom] = this.testData[ipFrom] ? [...this.testData[ipFrom], data] : [data]
            })

            ipsTo.forEach(ip => {
                if(!(ip in this.serversPorts)) {
                    this.serversPorts[ip] = { TCP: [], UDP: [] }
                }
                this.serversPorts[ip][rule.transport].push(...ports.map(item => item.dstPorts).flat())
            })
        })
    }

    get() {
        return {
            testData: this.testData,
            serverPorts: this.serversPorts
        }
    }
}