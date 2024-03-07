import { logger } from "../logger/logger.service";
import { HBFDataCollector } from "./hbf-data-collector.abstract";
import { DirectionType, ITcpUdpTestData, PortsForServers, TestDataRecord } from "./interfaces";

export class S2STcpUdpIEDataCollector extends HBFDataCollector {

    private testData: TestDataRecord = {}
    private serversPorts: PortsForServers = {}

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
        await this.collectS2STcpUdpIERules()
    }

    convert(): void {
        logger.info('Выделяем тестовые данные для S2S IE TCP/UDP правил')

        if (!this.sgToSgIETcpUdpRules)
            throw new Error("SG Rules is undefined")

        this.sgToSgIETcpUdpRules.forEach(rule => {
            //Обязательно существует два встречных правилах
            //Анализируем только строки с Egress
            //В test-data могут быть только строки

            if (rule.traffic == "Ingress")
                return

            const ipsFrom = this.getIPs(rule.SgLocal)
            const ipsTo = this.getIPs(rule.Sg)
            const ports = this.transformPorts(rule.ports)

            const data: ITcpUdpTestData = {
                from: rule.SgLocal,
                fromType: DirectionType.SG,
                to: rule.Sg,
                toType: DirectionType.SG,
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
        })
    }

    get() {
        return {
            testData: this.testData,
            serversPorts: this.serversPorts,
        }
    }

}