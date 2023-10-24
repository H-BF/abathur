import { IAdvancedScenario } from "./advanced.scenario.interface";

export interface IAdvancedScenarioMapping {
    [key: string]: { new(ip: string, funcType: string): IAdvancedScenario }
}