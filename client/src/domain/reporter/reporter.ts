import { isIcmpResult, isTcpUdpResult } from "../../helper";
import { AssertionStatus, IIcmpAssertionCreateReq, ITcpUdpAssertionCreateReq, Protocol } from "../../infrastructure/reporter/interfaces/assertion-create.interface";
import { ReporterClient } from "../../infrastructure/reporter/reporter";
import { variables } from "../../infrastructure/var_storage/variables-storage";
import { IIcmpResult, ITcpUdpResult, TResult } from "../interfaces";
import { logger } from "../logger/logger.service";

export class Reporter {

    private client: ReporterClient
    private launchUUID: string

    constructor(launchUUID: string) {
        this.launchUUID = launchUUID
        this.client = new ReporterClient()
    }

    async send(results: TResult[]) {
        const assertions = this.transform(results)

        logger.info('assertions: ')
        logger.info(assertions)

        await this.client.createAssertions(assertions)
    }

    private transform(data: TResult[]): ITcpUdpAssertionCreateReq[] | IIcmpAssertionCreateReq[] {
        let result: ITcpUdpAssertionCreateReq[] | IIcmpAssertionCreateReq[] = []
        
        if (isIcmpResult(data)) {
            result = this.transformIcmp(data)
        } else if (isTcpUdpResult(data)) {
            result = this.transformTcpUdp(data)
        } else {
            throw new Error("Неизвестный тип данных")
        }

        return result
    }

    private transformTcpUdp(data: ITcpUdpResult[]) {
        let result: ITcpUdpAssertionCreateReq[] = []
        data.forEach(elem => {
            result.push({
                launchUUID: this.launchUUID,
                srcIp: elem.srcIp,
                srcPort: elem.srcPort || 'any',
                dstIp:  elem.dstIp,
                dstPort: elem.dstPort || 'any',
                protocol: elem.protocol as Protocol,
                from: elem.from,
                to: elem.to,
                fromType: elem.fromType, 
                toType: elem.toType,
                status: elem.status as AssertionStatus,
                msgErr: elem.msgErr || null,
                testName: variables.get("TEST_NAME"),
                traffic: elem.traffic
            })
        })
        return result
    }

    private transformIcmp(data: IIcmpResult[]) {
        let result: IIcmpAssertionCreateReq[] = []
        data.forEach(elem => {
            result.push({
                launchUUID: this.launchUUID,
                srcIp: elem.srcIp,
                dstIp:  elem.dstIp,
                protocol: elem.protocol.toLocaleLowerCase() as Protocol,
                from: elem.from,
                to: elem.to,
                fromType: elem.fromType, 
                toType: elem.toType,
                status: elem.status as AssertionStatus,
                icmpType: elem.icmpType.join(),
                icmpCommand: elem.icmpCommand,
                msgErr: elem.msgErr || null,
                testName: variables.get("TEST_NAME"),
                traffic: elem.traffic
            })
        })
        return result
    }
}