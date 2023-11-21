import { ChangeIpScenario } from "./advanced.change-ip.scenario";
import { IcmpScenario } from "./advanced.icmp.scenario";
import { IAdvancedScenarioMapping } from "./interface/advanced.scenario.maping.interface";

export const advancedScenarioMaping: IAdvancedScenarioMapping = {
    "changeip": ChangeIpScenario,
    "icmp": IcmpScenario
}