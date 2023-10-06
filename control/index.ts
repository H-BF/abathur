import { controlServer } from "./src/domain/grpc/control";
import { waitScenarioIsFinish } from "./src/domain/helpers";
import { manager } from "./src/domain/k8s/PSCFabric";
import { podInf } from "./src/domain/k8s/podInformer";
import { logger } from "./src/domain/logger/logger.service";
import { proxy } from "./src/domain/proxy/reporter.proxy.server";
import { HBFApiScenario } from "./src/domain/scenarios/hbf.api.scenario";
import { HBFFunctionalScenario } from "./src/domain/scenarios/hbf.functional.scenario";
import { variables } from "./src/infrastructure/var_storage/variables-storage";

(async () => {
    try {
        await podInf.create()

        podInf.start()
        controlServer.start()
        await variables.resolveReporterHosts()
        proxy.start()

        const scenario = Number(variables.get("SCENARIO"))
        logger.info(`[MAIN] Сценарий: ${scenario}`)
        switch(scenario) {
            case 1: {
                const funcScenario = new HBFFunctionalScenario()
                funcScenario.start()
                await waitScenarioIsFinish([funcScenario])
                break
            }
            case 2: {
                const apiScenario = new HBFApiScenario()
                apiScenario.start()
                await waitScenarioIsFinish([apiScenario])
                break
            }
            case 99: {
                const funcScenario = new HBFFunctionalScenario()
                const apiScenario = new HBFApiScenario()
                funcScenario.start()
                apiScenario.start()
                await waitScenarioIsFinish([funcScenario, apiScenario])
                break
            }
            default: {
                logger.info(`[MAIN] Сценарий ${scenario} не известен`)
            }
        }
    } catch(err) {
        logger.error(err)
    } finally {
        proxy.stop()
        if(variables.get("IS_DESTROY_AFTER") === "true") {
            await manager.destroyAbathur()
        }
    }
})();
