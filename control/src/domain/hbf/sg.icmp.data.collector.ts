import { logger } from "../logger/logger.service";
import { HBFDataCollector } from "./hbf-data-collector.abstract";
import { IIcmpTestData, TestDataRecord } from "./interfaces";

export class SgIcmpDataCollector extends HBFDataCollector {
    
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
        await this.collectSgIcmpRules()
    }

    convert(): void {
        logger.info('Выделяем тестовые данные для Sg ICMP правил')

        if(!this.sgIcmpRules)
            throw new Error("ICMP SG Rules is undefined")

        const baseSg = this.sgIcmpRules.find(e => e.Sg.includes('sg-base'))

        if(!baseSg)
            throw new Error("sg-base is missing")

        const baseSgIP = this.getIPs(baseSg.Sg)

        this.sgIcmpRules.forEach(rule => {

            if(rule.Sg.includes('sg-base'))
                return

            const ips = this.getIPs(rule.Sg)
            const types = this.transformTypes(rule.ICMP.Types)

            const dataFrom: IIcmpTestData = {
                from: rule.Sg,
                to: baseSg.Sg,
                dst: baseSgIP,
                IPv: rule.ICMP.IPv,
                traffic: 'unknown',
                types: types
            }

            const dataTo: IIcmpTestData = {
                from: baseSg.Sg,
                to: rule.Sg,
                dst: this.getIPs(rule.Sg),
                IPv: rule.ICMP.IPv,
                traffic: 'unknown',
                types: types
            }

            baseSgIP.forEach( ip => {
                this.testData[ip] = this.testData[ip] ? [...this.testData[ip], dataTo] : [dataTo]
            })

            ips.forEach(ip => {
                this.testData[ip] = this.testData[ip] ? [...this.testData[ip], dataFrom] : [dataFrom]
            })
        })
    }

    get() {
        return {
            testData: this.testData
        }
    }
}