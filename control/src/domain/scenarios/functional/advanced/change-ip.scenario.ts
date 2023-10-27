import { ScenarioTemplate } from "../scenario.template";
import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { manager } from "../../../k8s/PSCFabric";
import { streamChangeIpHandler } from "../../../grpc/stream.change-ip.handler";
import { Phase } from "../../../grpc/enums/change-ip.phase";
import { svcInf } from "../../../k8s/svcInformer";
import { logger } from "../../../logger/logger.service";
import { delay } from "../../../helpers";

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

            const { hbfTestData, fqdn, ports } = await this.collectTestData(this.prefix)
            const ip = Object.keys(hbfTestData)[0]
            const serviceName = fqdn[0].split(".")[0]
          
            await manager.createHBFTestStend(
                this.prefix,
                0,
                ip,
                JSON.stringify({ scenario: this.prefix, testData: hbfTestData[ip] }),
                JSON.stringify(ports[ip]),
                false
            )
    
            await manager.createFQDNTestStend(
                this.prefix,
                serviceName,
                JSON.stringify(ports[fqdn[0]]),
                this.evalutePorts(ports[fqdn[0]]).map((item, index) => ({
                    name: `${fqdn[0].split(".")[0]}-${index}`,
                    port: Number(item),
                    targetPort: Number(item)
                }))
            )
    
            //Ждем завершения первой фазы теста: Правила считались запрос сделан
            await streamChangeIpHandler.waitPhaseIs(Phase.FINISH_ONE)
            
            await manager.destroySVC(serviceName)
    
            await svcInf.waitUntilDataIsMissing(serviceName)
    
            await manager.createFqdnService(
                this.prefix,
                serviceName,
                this.evalutePorts(ports[fqdn[0]]).map((item, index) => ({
                    name: `${fqdn[0].split(".")[0]}-${index}`,
                    port: Number(item),
                    targetPort: Number(item)
                }))
            )
    
            await svcInf.waitClusterIpForSvc(serviceName)

            //Даем время что бы HBF агент прописал правила после подъема сервиса
            await delay(60_000)
    
            streamChangeIpHandler.phase = Phase.START_TWO

            await streamChangeIpHandler.waitPhaseIs(Phase.FINISH_ALL)
    
            this.passCount = streamChangeIpHandler.passCount
            this.failCount = streamChangeIpHandler.failCount
        } catch(err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
            if(variables.get("IS_DESTROY_AFTER") === "true") {
                await manager.destroyAllByInstance(this.prefix)
            }
        }
    }
    
    isFinish(): boolean {
        return this.finish
    }
}