import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { SimpleFuncType } from "../../../grpc/enums/simple.func.types";
import { streamSimpleFuncHandler } from "../../../grpc/stream.simple.func.handler";
import { S2CTcpUdpIEDataCollector } from "../../../hbf/s2c.tcp-udp.ie.data.collector";
import { waitSetSize } from "../../../helpers";
import { manager } from "../../../k8s/PSCFabric";
import { logger } from "../../../logger/logger.service";
import { ScenarioTemplate } from "../scenario.template";

export class Sg2CidrIEScenario extends ScenarioTemplate {

    constructor() {
        super(
            "simple-s2c-ie",
            variables.get("S2C_IE_HBF_SERVER_IP"),
            variables.get("S2C_IE_HBF_SERVER_PORT"),
            "../../../../../sql/func/simple/s2c.ie.simple.sql"
        )
    }

    async start() {
        try {
            await super.start()

            const collector = new S2CTcpUdpIEDataCollector(
                "http",
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                "80"
            )

            await collector.collect()
            collector.convert()

            const { testData, serverPorts, ips } = collector.get()

            for (let i = 0; i < ips.length; i++) {
                if(ips[i].haveAgent) {
                    await manager.createHBFTestStend(
                        this.prefix,
                        i,
                        ips[i].ip,
                        JSON.stringify({ scenario: this.prefix, testData: testData[ips[i].ip] }),
                        JSON.stringify(serverPorts[ips[i].ip])
                    )
                } else {
                    await manager.createTestStend(
                        this.prefix,
                        i,
                        ips[i].ip,
                        JSON.stringify({ scenario: this.prefix, testData: testData[ips[i].ip] }),
                        JSON.stringify(serverPorts[ips[i].ip])
                    )
                }
            }

            streamSimpleFuncHandler.setClientPodsNumber(
                SimpleFuncType.S2C,
                Object.keys(testData).length
            )

            await waitSetSize(
                streamSimpleFuncHandler.getStreamList(SimpleFuncType.S2C),
                Object.keys(testData).length,
                3_600_000, 
                5
            )

            await waitSetSize(
                streamSimpleFuncHandler.getStreamList(SimpleFuncType.S2C),
                0,
                3_600_000,
                1_000
            )

            this.failCount = streamSimpleFuncHandler.errorCounter[SimpleFuncType.S2C].fail
            this.passCount = streamSimpleFuncHandler.errorCounter[SimpleFuncType.S2C].pass

        } catch(err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
        }
    }
}  