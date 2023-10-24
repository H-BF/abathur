import { LaunchStatus } from "../../../infrastructure/reporter"
import { variables } from "../../../infrastructure/var_storage/variables-storage"
import { streamSimpleFuncHandler } from "../../grpc/stream.simple.func.handler"
import { waitScenarioIsFinish } from "../../helpers"
import { logger } from "../../logger/logger.service"
import { HBFReporter } from "../../reporter/hbf.reporter"
import { IScenarioInterface } from "../interface/scenario.interface"
import { scenarioMaping } from "../scenario.maping"

export class InitFuncScenarios implements IScenarioInterface {

    private reporter: HBFReporter
    private funcScenarios: string[]
    private scenarios: IScenarioInterface[] = []
    private finish: boolean = false

    failCount: number = 0
    passCount: number = 0

    constructor(funcScenarios: string[]) {
        this.funcScenarios = funcScenarios
        this.reporter = new HBFReporter()
    }

    async start() {
        try {
            logger.info("[FUNC] HBF functional tests")
            const startTime = Date.now()
            
            await this.reporter.createLaunch(
                variables.get("PIPELINE_ID"),
                variables.get("JOB_ID"),
                variables.get("CI_SOURCE_BRANCH_NAME"),
                variables.get("CI_TARGET_BRANCH_NAME"),
                variables.get("COMMIT"),
                variables.get("HBF_TAG"),
                "func"
            )

            variables.set("FUNC_LAUNCH_UUID", this.reporter.launchUUID)

            this.funcScenarios.forEach(scenario => {
                if(!(scenario in scenarioMaping))
                    throw new Error(`Неизвестный ключ ${scenario}. Ключи: ${Object.keys(scenarioMaping)}`)

                const sc = new scenarioMaping[scenario]()
                this.scenarios.push(sc)
                sc.start()
            })
            await this.reporter.setStauts(LaunchStatus.IN_PORCESS)
            await waitScenarioIsFinish(this.scenarios)

            this.scenarios.forEach(scenario => {
                this.failCount += scenario.failCount
                this.passCount += scenario.passCount
            })

            await this.reporter.closeLaunch(
                this.failCount,
                this.passCount,
                Date.now() - startTime
            )
        } catch(err) {
            logger.error(err)
            await this.reporter.closeLaunchWithError(`${err}`)
        } finally {
            this.finish = true
        }
    }

    isFinish(): boolean {
        return this.finish
    }
}