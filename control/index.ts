import { controlServer } from "./src/domain/grpc/control";
import { manager } from "./src/domain/k8s/PSCFabric";
import { podInf } from "./src/domain/k8s/podInformer";
import { HBFApiScenario } from "./src/domain/scenarios/hbf.api.scenario";
import { HBFFunctionalScenario } from "./src/domain/scenarios/hbf.functional.scenario";
import { variables } from "./src/infrastructure/var_storage/variables-storage";

(async () => {
    try {
        await podInf.create()

        podInf.start()
        controlServer.start()

        const scenario = Number(variables.get("SCENARIO"))
        console.log(`Сценарий: ${scenario}`)
        switch(scenario) {
            case 1: {
                const funcScenario = new HBFFunctionalScenario()
                funcScenario.start()
                break
            }
            case 2: {
                const apiScenario = new HBFApiScenario()
                apiScenario.start()
                break
            }
            case 99: {
                const funcScenario = new HBFFunctionalScenario()
                funcScenario.start()
                const apiScenario = new HBFApiScenario()
                apiScenario.start()
                break
            }
            default: {
                console.log(`Сценарий ${scenario} не известен`)
            }
        }
    } catch(err) {
        console.log(err)
    } finally {
        if(variables.get("IS_DESTROY_AFTER") === "true") {
            await manager.destroyAbathur()
        }
    }
})();