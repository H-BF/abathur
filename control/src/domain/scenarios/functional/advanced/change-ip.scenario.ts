import { ScenarioTemplate } from "../scenario.template";
import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { manager } from "../../../k8s/PSCFabric";
import { streamChangeIpHandler } from "../../../grpc/stream.change-ip.handler";
import { Phase } from "../../../grpc/enums/change-ip.phase";
import { svcInf } from "../../../k8s/svcInformer";
import { logger } from "../../../logger/logger.service";
import { sleep } from "../../../helpers";
import { S2FTcpUdpDataCollector } from "../../../hbf/s2f.tcp-udp.data.collector";

export class ChangeIpScenario extends ScenarioTemplate {
    
    constructor() {
        super(
            "advanced-changeip",
            variables.get("CANGE_IP_HBF_SERVER_IP"),
            variables.get("CANGE_IP_HBF_SERVER_PORT"),
            "../../../../sql/func/advanced/change-ip.advanced.sql",
            false
        )
    }
    
    async start() {
        try {
            await super.start()


            const collector = new S2FTcpUdpDataCollector(
                "http",
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                "80"
            )

            await collector.collect()
            collector.convert()
            const { testData, serverPorts, fqdn } = collector.get()

            const ip = Object.keys(testData)[0]
            const serviceName = fqdn[0].split(".")[0]
          
            await manager.createHBFTestStend(
                this.prefix,
                0,
                ip,
                JSON.stringify({ scenario: this.prefix, testData: testData[ip] }),
                JSON.stringify(serverPorts[ip]),
                false
            )

            await manager.createFQDNTestStend(
                this.prefix,
                serviceName,
                JSON.stringify(serverPorts[fqdn[0]]),
                this.evalutePorts(serverPorts[fqdn[0]]).map((item, index) => ({
                    name: `${fqdn[0].split(".")[0]}-${index}`,
                    protocol: item.protocol,
                    port: Number(item.port),
                    targetPort: Number(item.port)
                }))
            )
    
            //Ждем завершения первой фазы теста: Правила считались запрос сделан
            await streamChangeIpHandler.waitPhaseIs(Phase.FINISH_ONE)
            
            await manager.destroySVC(serviceName)
    
            await svcInf.waitUntilDataIsMissing(serviceName)
    
            await manager.createFqdnService(
                this.prefix,
                serviceName,
                this.evalutePorts(serverPorts[fqdn[0]]).map((item, index) => ({
                    name: `${fqdn[0].split(".")[0]}-${index}`,
                    protocol: item.protocol,
                    port: Number(item.port),
                    targetPort: Number(item.port)
                }))
            )
    
            await svcInf.waitClusterIpForSvc(serviceName)

            //Даем время что бы HBF агент прописал правила после подъема сервиса
            await sleep(60_000)
    
            streamChangeIpHandler.phase = Phase.START_TWO

            await streamChangeIpHandler.waitPhaseIs(Phase.FINISH_ALL)
    
            this.passCount = streamChangeIpHandler.passCount
            this.failCount = streamChangeIpHandler.failCount
        } catch(err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
        }
    }
    
    isFinish(): boolean {
        return this.finish
    }
}