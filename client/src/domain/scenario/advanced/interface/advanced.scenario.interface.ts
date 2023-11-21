import { TestDataType } from "../../../interfaces";

export interface IAdvancedScenario {
    start: (data: TestDataType[]) => Promise<void>
}