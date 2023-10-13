import { evalutePorts } from "../helper"
import { IData, IResult } from "./interfaces"
import { SocketClient } from "../infrastructure/socket/socket";
import { logger } from "./logger/logger.service";

export class TestClient {

    private srcIp: string
    private testResults: IResult[] = [];
    passCount: number = 0
    failCount: number = 0

    constructor(scrIp: string) {
        this.srcIp = scrIp
    }

   async runTests(data: IData[]) {
        for (const node of data) {
            for (const dstIp of node.dst) {
                for (const ports of node.ports) {
                    const srcPorts = evalutePorts(ports.srcPorts)
                    const dstPorts = evalutePorts(ports.dstPorts)
                    
                    for (const dstPort of dstPorts) {
                        for (const srcPort of srcPorts) {

                            let msgErr: string | undefined
                            let status = "fail"
                            
                            const client = new SocketClient()
                            try {
                                await client.check(
                                    Number(srcPort),
                                    dstIp,
                                    Number(dstPort)
                                )
                                status = "pass"
                            } catch (err) {
                                msgErr = `${err}`
                                logger.error(err)
                            }

                            switch(status) {
                                case 'fail': 
                                    this.failCount++
                                    break
                                case 'pass':
                                    this.passCount++
                                    break
                            }

                            this.testResults.push({
                                sgFrom: node.sgFrom,
                                to: node.to,
                                srcIp: this.srcIp,
                                srcPort: srcPort,
                                dst: dstIp,
                                dstPort: dstPort,
                                protocol: node.transport,
                                status: status,
                                msgErr: msgErr
                            })
                        }
                    }
                }
            }   
        }
    }
    
    getResults(): IResult[] {
       return this.testResults
    }
}