import { controlServer } from "./src/domain/grpc/control";
import { waitScenarioIsFinish } from "./src/domain/helpers";
import { instanceList } from "./src/domain/instance.list";
import { manager } from "./src/domain/k8s/PSCFabric";
import { podInf } from "./src/domain/k8s/podInformer";
import { svcInf } from "./src/domain/k8s/svcInformer";
import { logger } from "./src/domain/logger/logger.service";
import { proxy } from "./src/domain/proxy/reporter.proxy.server";
import { ApiScenario } from "./src/domain/scenarios/api.scenario";
import { InitFuncScenarios } from "./src/domain/scenarios/functional/init.func.scenarios";
import { variables } from "./src/infrastructure/var_storage/variables-storage";

(async () => {
    try {
        await podInf.create()
        await svcInf.create()

        podInf.start()
        svcInf.start()
        controlServer.start()
        await variables.resolveReporterHosts()
        proxy.start()

        const scenario = Number(variables.get("SCENARIO"))
        const funcScenario = variables.get("FUNC_SCENARIO")

        logger.info(`[MAIN] Сценарий: ${scenario}`)
        logger.info(`[MAIN] Функциональные сценарии: ${funcScenario}`)

        switch(scenario) {
            case 1: {
                const funcDefault = new InitFuncScenarios(funcScenario.split(","))
                funcDefault.start()
                await waitScenarioIsFinish([funcDefault], 300_000)
                break
            }
            case 2: {
                const apiScenario = new ApiScenario()
                apiScenario.start()
                await waitScenarioIsFinish([apiScenario], 600_000)
                break
            }
            case 99: {
                const funcDefault = new InitFuncScenarios(funcScenario.split(","))
                const apiScenario = new ApiScenario()
                funcDefault.start()
                apiScenario.start()
                await waitScenarioIsFinish([
                    funcDefault,
                    apiScenario
                ], 600_000)
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
            instanceList.forEach( async instance => {
                await manager.destroyAllByInstance(instance)
            })
        }
    }
})();