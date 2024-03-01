import { variables } from "../../../../infrastructure/var_storage/variables-storage";
import { logger } from "../../../logger/logger.service";
import { ScenarioTemplate } from "../scenario.template";

export class Sg2SgIEScenario extends ScenarioTemplate {

    constructor() {
        super(
            "simple-s2c-ie",
            variables.get("S2S_IE_HBF_SERVER_IP"),
            variables.get("S2S_IE_HBF_SERVER_PORT"),
            "../../../../../sql/func/simple/s2s.ie.simple.sql"
        )
    }

    async start() {
        try {
            await super.start()

        } catch (err) {
            logger.error(`${err}`)
        } finally {
            this.finish = true
        }
    }
}