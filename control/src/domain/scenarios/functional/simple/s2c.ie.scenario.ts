import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { S2CTcpUdpIEDataCollector } from "../../../hbf/s2c.tcp-udp.ie.data.collector";
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

        } catch(err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
        }
    }
}