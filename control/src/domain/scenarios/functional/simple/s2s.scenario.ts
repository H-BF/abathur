import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { streamSimpleFuncHandler } from "../../../grpc/stream.simple.func.handler";
import { SimpleFuncType } from "../../../grpc/enums/simple.func.types";
import { ScenarioTemplate } from "../scenario.template";
import { logger } from "../../../logger/logger.service";
import { manager } from "../../../k8s/PSCFabric";
import { waitSetSize } from "../../../helpers";
import { S2STcpUdpDataCollector } from "../../../hbf/s2s.tcp-udp.data.collector";

export class Sg2SgScenario extends ScenarioTemplate {

    constructor() {
        super(
            "simple-s2s",
            variables.get("S2S_HBF_SERVER_IP"),
            variables.get("S2S_HBF_SERVER_PORT"),
            "../../../../sql/func/simple/s2s.simple.sql"
        )
    }

    async start() {
        try {
            await super.start()

            const collector = new S2STcpUdpDataCollector(
                "http",
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                "80"
            )

            await collector.collect()
            collector.convert()
            const { testData, serverPorts } = collector.get()

            const keys = Object.keys(testData)

            for (let i = 0; i < keys.length; i++) {
                await manager.createHBFTestStend(
                    this.prefix,
                    i,
                    keys[i],
                    JSON.stringify({ scenario: this.prefix, testData: testData[keys[i]] }),
                    JSON.stringify(serverPorts[keys[i]])
                )
            }

            streamSimpleFuncHandler.setClientPodsNumber(
                SimpleFuncType.S2S,
                keys.length
            )

            await waitSetSize(
                streamSimpleFuncHandler.getStreamList(SimpleFuncType.S2S),
                keys.length,
                3_600_000, 
                5
            )

            await waitSetSize(
                streamSimpleFuncHandler.getStreamList(SimpleFuncType.S2S),
                0,
                3_600_000,
                1_000
            )

            this.failCount = streamSimpleFuncHandler.errorCounter[SimpleFuncType.S2S].fail
            this.passCount = streamSimpleFuncHandler.errorCounter[SimpleFuncType.S2S].pass

        } catch(err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
        }
    }
}