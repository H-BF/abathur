import { evalutePorts } from "./helper"
import { IData, IResult, IResults } from "./interfaces"
import { SocketClient } from "./socket";

export class TestClient {

    private srcIp: string
    private testResults: IResult[] = [];

    constructor(scrIp: string) {
        this.srcIp = scrIp
    }

   async runTests(data: IData[]) {
        for (const node of data) {
            for (const dstIp of node.dstIps) {
                for (const ports of node.ports) {
                    const srcPorts = evalutePorts(ports.srcPorts)
                    const dstPorts = evalutePorts(ports.dstPorts)
                    
                    for (const dstPort of dstPorts) {
                        for (const srcPort of srcPorts) {

                            let msgErr: string | undefined
                            let status = "FAIL"
                            
                            const client = new SocketClient()
                            try {
                                await client.check(
                                    Number(srcPort),
                                    dstIp,
                                    Number(dstPort)
                                )
                                status = "OK"
                            } catch (err) {
                                msgErr = `${err}`
                                console.log(`${err}`)
                            }


                            this.testResults.push({
                                sgFrom: node.sgFrom,
                                sgTo: node.sgTo,
                                srcIp: this.srcIp,
                                srcPort: srcPort,
                                dstIp: dstIp,
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
    
    getResults() {
        let r: IResults = {
            duration: 0,
            node: this.srcIp,
            results: []
        }

        this.testResults.forEach(res => {
            r.results.push(res)
        })

        return r
    }
}