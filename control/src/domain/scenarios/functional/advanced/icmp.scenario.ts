import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { streamIcmpHandler } from "../../../grpc/stream.icmp.handler";
import { TestDataRecord } from "../../../hbf/interfaces";
import { S2SIcmpDataCollector } from "../../../hbf/s2s.icmp.data.collector";
import { SgIcmpDataCollector } from "../../../hbf/sg.icmp.data.collector";
import { waitSetSize } from "../../../helpers";
import { manager } from "../../../k8s/PSCFabric";
import { logger } from "../../../logger/logger.service";
import { ScenarioTemplate } from "../scenario.template";

export class ICMPScenario extends ScenarioTemplate {

    constructor() {
        super(
            "advanced-icmp",
            variables.get("ICMP_HBF_SERVER_IP"),
            variables.get("ICMP_HBF_SERVER_PORT"),
            "../../../../../sql/func/advanced/icmp.advanced.sql",
            true
        )
    }

    async start() {
        try {
            await super.start()

            const connection = {
                protocol: "http",
                host: `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                port: "80"
            }

            const sDataCollector = new SgIcmpDataCollector(connection.protocol, connection.host, connection.port)
            const s2sDataCollector = new S2SIcmpDataCollector(connection.protocol, connection.host, connection.port)

            await sDataCollector.collect()
            sDataCollector.convert()
            const sTestData = sDataCollector.get().testData

            await s2sDataCollector.collect()
            s2sDataCollector.convert()
            const s2sTestData = s2sDataCollector.get().testData

            const testData = { ...sTestData };

            for (const key in s2sTestData) {
              if (testData.hasOwnProperty(key)) {
                testData[key] = testData[key].concat(s2sTestData[key]);
              } else {
                testData[key] = s2sTestData[key];
              }
            }

            const keys = Object.keys(testData)
            for (let i = 0; i < keys.length; i++) {
            await manager.createHBFTestStend(
                this.prefix,
                i,
                keys[i],
                JSON.stringify({ scenario: this.prefix, testData: testData[keys[i]] }),
                "[]"
            )
            }

            streamIcmpHandler.setPodNumbers(keys.length)

            await waitSetSize(
                streamIcmpHandler.getStreamList(),
                keys.length,
                3_600_000, 
                5
            )

            await waitSetSize(
                streamIcmpHandler.getStreamList(),
                0,
                3_600_000, 
                5
            )

            this.failCount = streamIcmpHandler.fail
            this.passCount = streamIcmpHandler.pass

        } catch (err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
        }
    }

    isFinish(): boolean {
        return this.finish
    }
}