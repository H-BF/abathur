import { AssertionStatus, IAssertionCreateReq, Protocol } from "../../infrastructure/reporter/interfaces/assertion-create.interface";
import { ReporterClient } from "../../infrastructure/reporter/reporter";
import { IResult } from "../interfaces";

export class Reporter {

    private client: ReporterClient
    private launchUUID: string

    constructor(launchUUID: string) {
        this.launchUUID = launchUUID
        this.client = new ReporterClient()
    }

    async send(results: IResult[]) {
        const assertions = this.transform(results)

        console.log('assertions: ')
        console.log(assertions)

        await this.client.createAssertions(assertions)
    }

    private transform(data: IResult[]): IAssertionCreateReq[] {
        let result: IAssertionCreateReq[] = []
        data.forEach(elem => {
            result.push({
                launchUUID: this.launchUUID,
                srcIp: elem.srcIp,
                srcPort: elem.srcPort || 'any',
                dstIp:  elem.dstIp,
                dstPort: elem.dstPort || 'any',
                protocol: elem.protocol.toLocaleLowerCase() as Protocol,
                sgFrom: elem.sgFrom,
                sgTo: elem.sgTo,
                status: elem.status as AssertionStatus,
                msgErr: elem.msgErr || null
            })
        })
        return result
    }
}