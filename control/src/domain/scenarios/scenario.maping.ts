import { ChangeIpScenario } from "./functional/advanced/change-ip.scenario";
import { ICMPScenario } from "./functional/advanced/icmp.scenario";
import { Sg2CidrIEScenario } from "./functional/simple/s2c.ie.scenario";
import { Sg2FqdnScenario } from "./functional/simple/s2f.scenario";
import { Sg2SgScenario } from "./functional/simple/s2s.scenario";
import { IScenariosMapping } from "./interface/scenario.maping.interface";

export const scenarioMaping: IScenariosMapping = {
    "simple-s2s": Sg2SgScenario,
    "simple-s2f": Sg2FqdnScenario,
    "simple-s2c-ie": Sg2CidrIEScenario,
    
    "advanced-changeip": ChangeIpScenario,
    "advanced-icmp": ICMPScenario
}