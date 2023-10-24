import { IScenarioInterface } from "./scenario.interface";

export interface IScenariosMapping {
    [key: string]:  { new(): IScenarioInterface };
}