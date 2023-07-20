import { CLIENT_NGINX_IP, CLIENT_NGINX_PORT } from "../config"
import { HbfTestClient } from "./grpc/HBFTestClient"
import { delay, evalutePorts } from "./helper"
import { Metadata, ServiceError } from "@grpc/grpc-js"
import { IData, IResult, IResults } from "./interfaces"

export class TestClient {

    private srcIp: string
    private client: HbfTestClient
    private testData: {srcPort: string, data: Metadata}[] = [];
    private testResults: IResult[] = [];
    private duration: number = 0;

    constructor(scrIp: string) {
        this.srcIp = scrIp
        this.client = new HbfTestClient(CLIENT_NGINX_IP, CLIENT_NGINX_PORT)
    }

    evolveTestData(data: IData[]) {
        for (const node of data) {
            for (const dstIp of node.dstIps) {
                for (const rule of node.rules) {
        
                    const srcPorts = evalutePorts(rule.srcPorts)
                    const dstPorts = evalutePorts(rule.dstPorts)

                    console.log(srcPorts)
                    console.log(dstPorts)
                    console.log('\n')
    
                    for (const dstPort of dstPorts) {
                        for (const srcPort of srcPorts) {
                            this.testData.push({
                                srcPort: srcPort,
                                data: this.client.collectMetadata(this.srcIp, srcPort, dstIp, dstPort)
                            })
                        }
                    }
                }
            }
        }
    }

    async runTests() {

        const startTime = Date.now()

        let reqTime: Record<string, number> = {};
        while(this.testData.length != 0) {
            for (let i = 0; i < this.testData.length; i++) {
                const data = this.testData[i]
                if (reqTime[data.srcPort] != undefined) {
                    if (Date.now() - reqTime[data.srcPort] <= 120000) {
                        console.log(`Порт ${data.srcPort} использовался менее 2 минут назад. Пропускаем!`)
                        continue
                    }
                }
                let result: IResult = this.client.getFromMetadata(data.data);

                try {
                    console.log(`Посылаем запрос c порта ${data.srcPort || 'any'} на порт ${data.data.get('dst-port')}`)
                    const res = await this.client.ping(data.data)
                    result.msg = res?.msg!
                } catch (err) {
                    const grpcError = err as ServiceError;
                    console.log(err)
                    if (grpcError.code == 13 && grpcError.details == 'Received RST_STREAM with code 0') {
                        result.msg = 'FAIL'
                    }
                }
                console.log(result)
                this.testResults.push(result)

                if (data.srcPort != "") {
                    reqTime[data.srcPort] = Date.now()
                }
                delete this.testData[i]
            }
            this.testData = this.testData.filter(Boolean)
            if (this.testData.length != 0) {
                await delay(120000)
            }
        }

        this.duration = Date.now() - startTime
    }

    getResults() {
        let r: IResults = {
            duration: this.duration,
            node: this.srcIp,
            results: []
        }

        this.testResults.forEach(res => {
            r.results.push(res)
        })

        return r
    }
}