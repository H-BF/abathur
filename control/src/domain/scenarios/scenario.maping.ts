import { ChangeIpScenario } from "./functional/advanced/change-ip.scenario";
import { ICMPScenario } from "./functional/advanced/icmp.scenario";
import { Sg2CidrIETcpUdpScenario } from "./functional/simple/s2c.tcp-udp.ie.scenario";
import { Sg2FqdnScenario } from "./functional/simple/s2f.scenario";
import { Sg2SgScenario } from "./functional/simple/s2s.scenario";
import { Sg2SgIETcpUdpScenario } from "./functional/simple/s2s.tcp-udp.ie.scenario";
import { IScenariosMapping } from "./interface/scenario.maping.interface";

export const scenarioMaping: IScenariosMapping = {
    "simple-s2s": Sg2SgScenario,
    "simple-s2f": Sg2FqdnScenario,
    "simple-s2c-ie": Sg2CidrIETcpUdpScenario,
    "simple-s2s-ie": Sg2SgIETcpUdpScenario,

    "advanced-changeip": ChangeIpScenario,
    "advanced-icmp": ICMPScenario
}