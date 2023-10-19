import { HBFReporter } from "../../reporter/hbf.reporter";
import { IScenarioInterface } from "./scenario.interface";

export interface IScenariosMapping {
    [key: string]:  { new(): IScenarioInterface };
}