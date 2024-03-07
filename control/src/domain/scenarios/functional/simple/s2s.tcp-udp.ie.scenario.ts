import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { SimpleFuncType } from "../../../grpc/enums/simple.func.types";
import { streamSimpleFuncHandler } from "../../../grpc/stream.simple.func.handler";
import { S2STcpUdpIEDataCollector } from "../../../hbf/s2s.tcp-udp.ie.data.collector";
import { waitSetSize } from "../../../helpers";
import { manager } from "../../../k8s/PSCFabric";
import { logger } from "../../../logger/logger.service";
import { ScenarioTemplate } from "../scenario.template";

export class Sg2SgIETcpUdpScenario extends ScenarioTemplate {

    constructor() {
        super(
            "simple-s2sie",
            variables.get("S2S_IE_HBF_SERVER_IP"),
            variables.get("S2S_IE_HBF_SERVER_PORT"),
            "../../../../../sql/func/simple/s2s.ie.simple.sql"
        )
    }

    async start() {
        try {
            await super.start()

            const collector = new S2STcpUdpIEDataCollector(
                "http",
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                "80"
            )

            await collector.collect()
            collector.convert()

            const { testData, serversPorts } = collector.get()

            console.log(testData)
            console.log(serversPorts)

            const keys = Array.from(new Set(Object.keys(testData).concat(Object.keys(serversPorts))))

            console.log(keys)

            for (let i = 0; i < keys.length; i++) {
                await manager.createHBFTestStend(
                    this.prefix,
                    i,
                    keys[i],
                    JSON.stringify({ scenario: this.prefix, testData: testData[keys[i]] }),
                    JSON.stringify(serversPorts[keys[i]])
                )
            }

            streamSimpleFuncHandler.setClientPodsNumber(
                SimpleFuncType.S2S_IE,
                Object.keys(testData).length
            )

            await waitSetSize(
                streamSimpleFuncHandler.getStreamList(SimpleFuncType.S2S_IE),
                Object.keys(testData).length,
                3_600_000,
                5
            )

            await waitSetSize(
                streamSimpleFuncHandler.getStreamList(SimpleFuncType.S2S_IE),
                0,
                3_600_000,
                1_000
            )

            this.failCount = streamSimpleFuncHandler.errorCounter[SimpleFuncType.S2S_IE].fail
            this.passCount = streamSimpleFuncHandler.errorCounter[SimpleFuncType.S2S_IE].pass
        } catch (err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
        }
    }
}