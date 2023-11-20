import { ICMP } from "../../../infrastructure/icmp";
import { DirectionType, IIcmpTestData, TResult } from "../../interfaces"
import { logger } from "../../logger/logger.service";
import { ITestClient } from "./test.client.interface"

export class IcmpTestClient implements ITestClient {

    private srcIp: string
    private testResults: TResult[] = []
    passCount: number = 0
    failCount: number = 0

    constructor(srcIp: string) {
        this.srcIp = srcIp
    }

    async runTests(data: IIcmpTestData[]) {
        for (const node of data) {
            for (const dstIp of node.dst) {
              let msgErr: string | undefined  
              let status = "fail"

              const client = new ICMP()

              try{
                await client.ping(dstIp)
                status = "pass"
              }
              catch(err) {
                msgErr = `${err}`
                logger.error(err)
              }
              
              switch(status) {
                case 'fail':
                  this.failCount++
                  break;
                case 'pass':
                  this.passCount++
                  break;
              }

              this.testResults.push({
                from: node.from,
                to: node.to,
                fromType:DirectionType.SG,
                toType: DirectionType.SG,
                srcIp: this.srcIp,
                dstIp: dstIp,
                protocol: "icmp",
                status: status,
                icmpCommand: "ping",
                icmpType: node.types,
                msgErr: msgErr
              })
            }
        }
    }

    getResults(): TResult[] {
      return this.testResults
   }
}