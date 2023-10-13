import { IRulePorts } from "./rules"

export interface IToFqdnRulesReq {
    sgFrom: string[]
}

export interface IToFqdnRules {
    rules: IToFqdnRule[]
}

export interface IToFqdnRule {
    ports: IRulePorts[]
    sgFrom: string
    FQDN: string
    transport: string
    logs: boolean
}