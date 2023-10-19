import { V1ConfigMap } from "@kubernetes/client-node";
import { IScenarioInterface } from "../../interface/scenario.interface";
import { HBFReporter } from "../../../reporter/hbf.reporter";

export class ChangeIpScenario implements IScenarioInterface {
    
    private prefix = ""
    private sharedConfigMaps: V1ConfigMap[] = []

    private reporter: HBFReporter
    private finish: boolean = false

    constructor() {
        this.reporter = new HBFReporter()
    }

    async start() {}
    
    isFinish(): boolean {
        return this.finish
    }
}