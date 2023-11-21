import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { SimpleFuncType } from "../../../grpc/enums/simple.func.types";
import { streamSimpleFuncHandler } from "../../../grpc/stream.simple.func.handler";
import { S2FTcpUdpDataCollector } from "../../../hbf/s2f.tcp-udp.data.collector";
import { waitSetSize } from "../../../helpers";
import { manager } from "../../../k8s/PSCFabric";
import { logger } from "../../../logger/logger.service";
import { ScenarioTemplate } from "../scenario.template";

export class Sg2FqdnScenario extends ScenarioTemplate {

    constructor() {
        super(
            "simple-s2f",
            variables.get("S2F_HBF_SERVER_IP"),
            variables.get("S2F_HBF_SERVER_PORT"),
            "../../../../sql/func/simple/s2f.simple.sql"
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

            for (let i = 0; i < fqdn.length; i++) {
                await manager.createFQDNTestStend(
                    this.prefix,
                    fqdn[i].split(".")[0],
                    JSON.stringify(serverPorts[fqdn[i]]),
                    this.evalutePorts(serverPorts[fqdn[i]]).map((item, index) => ({
                        name: `${fqdn[i].split(".")[0]}-${index}`,
                        port: Number(item),
                        targetPort: Number(item)
                    }))
                )
            }

            streamSimpleFuncHandler.setClientPodsNumber(
                SimpleFuncType.S2F,
                keys.length
            )

            await waitSetSize(
                streamSimpleFuncHandler.getStreamList(SimpleFuncType.S2F),
                keys.length,
                3_600_000, 
                5
            )

            await waitSetSize(
                streamSimpleFuncHandler.getStreamList(SimpleFuncType.S2F),
                0,
                3_600_000,
                1_000
            )

            this.failCount = streamSimpleFuncHandler.errorCounter[SimpleFuncType.S2F].fail
            this.passCount = streamSimpleFuncHandler.errorCounter[SimpleFuncType.S2F].pass

        } catch(err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
            if(variables.get("IS_DESTROY_AFTER") === "true") {
                await manager.destroyAllByInstance(this.prefix)
            }
        }        
    }
}