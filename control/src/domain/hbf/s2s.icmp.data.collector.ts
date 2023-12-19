import { logger } from "../logger/logger.service";
import { HBFDataCollector } from "./hbf-data-collector.abstract";
import { IIcmpTestData, TestDataRecord } from "./interfaces";

export class S2SIcmpDataCollector extends HBFDataCollector {

    private testData: TestDataRecord = {}

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
        await this.collectS2SIcmpRules()
    }

    convert() {
        logger.info('Выделяем тестовые данные для S2S ICMP правил')

        if(!this.sgToSgIcmpRules)
            throw new Error("ICMP SG Rules is undefined")

        this.sgToSgIcmpRules.forEach( rule => {
            
            const ipsFrom = this.getIPs(rule.SgFrom)
            const types = this.transformTypes(rule.ICMP.Types)
            
            const data: IIcmpTestData = {
                from: rule.SgFrom,
                to: rule.SgTo,
                dst: this.getIPs(rule.SgTo),
                IPv: rule.ICMP.IPv,
                traffic: "unknown",
                types: types
            }

            ipsFrom.forEach( ipFrom => {
                this.testData[ipFrom] = this.testData[ipFrom] ? [...this.testData[ipFrom], data] : [data]
            })
        })
    }

    get() {
        return {
            testData: this.testData
        }
    }
}