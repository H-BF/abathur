import { IRulePorts } from "./rules"

export interface IToSgRulesReq {
    sgFrom: string[]
    sgTo: string[]
}

export interface IToSgRules {
    rules: IToSgRule[]
}

export interface IToSgRule {
    ports: IRulePorts[]
    sgFrom: string
    sgTo: string
    transport: string
    logs: boolean
}