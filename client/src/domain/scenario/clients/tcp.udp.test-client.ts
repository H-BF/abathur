import { evalutePorts, getIpByDNSName } from "../../../helper"
import { ITcpUdpTestData, TResult } from "../../interfaces"
import { TCPSocketClient } from "../../../infrastructure/socket/tcp.socket";
import { logger } from "../../logger/logger.service";
import net from 'net';
import { ITestClient } from "./test.client.interface";
import { UDPSocketClient } from "../../../infrastructure/socket/udp.socket";
import { ISocketClient } from "../../../infrastructure/socket/socket.client.interface";

export class TestClient implements ITestClient {

    private srcIp: string
    private testResults: TResult[] = [];
    passCount: number = 0
    failCount: number = 0

    constructor(scrIp: string) {
        this.srcIp = scrIp
    }

   async runTests(data: ITcpUdpTestData[]) {
        for (const node of data) {
            for (const dstIp of node.dst) {
                for (const ports of node.ports) {
                    const srcPorts = evalutePorts(ports.srcPorts)
                    const dstPorts = evalutePorts(ports.dstPorts)
                    
                    for (const dstPort of dstPorts) {
                        for (const srcPort of srcPorts) {

                            let msgErr: string | undefined
                            let status = "fail"  
                            
                            const client: ISocketClient = node.transport == 'TCP' ? new TCPSocketClient() : new UDPSocketClient()

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
                                from: node.from,
                                to: node.to,
                                fromType: node.fromType, 
                                toType: node.toType,
                                srcIp: this.srcIp,
                                srcPort: srcPort,
                                //Здесь мы смотрим чем является dstIp. Изночально в нем реально хранился IP
                                //А теперь с появлением FQDN мы все так же делаем запрос по dstIP, но он может 
                                //быть не IP, а именем. В отчет нам нужен все же IP. Поэтому проверяем является ли 
                                // dstIp IP, если нет торезолвим имя.
                                dstIp: net.isIP(dstIp) ? dstIp : await getIpByDNSName(dstIp),
                                dstPort: dstPort,
                                protocol: node.transport.toLocaleLowerCase() as 'tcp' | 'udp',
                                status: status,
                                msgErr: msgErr,
                                traffic: node.traffic.toLowerCase() as 'ingress' | 'egress' | 'unknown'
                            })
                        }
                    }
                }
            }   
        }
    }
    
    getResults(): TResult[] {
       return this.testResults
    }
}