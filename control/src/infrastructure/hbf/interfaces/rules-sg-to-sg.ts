import { IRulePorts } from "./rules"

export interface ISgToSgRulesReq {
    sgFrom: string[]
    sgTo: string[]
}

export interface ISgToSgRules {
    rules: ISgToSgRule[]
}

export interface ISgToSgRule {
    ports: IRulePorts[]
    sgFrom: string
    sgTo: string
    transport: string
    logs: boolean
}