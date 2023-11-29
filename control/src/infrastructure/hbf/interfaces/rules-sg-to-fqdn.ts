import { IRulePorts } from "./rules"

export interface ISgToFqdnRulesReq {
    sgFrom: string[]
}

export interface ISgToFqdnRules {
    rules: ISgToFqdnRule[]
}

export interface ISgToFqdnRule {
    ports: IRulePorts[]
    sgFrom: string
    FQDN: string
    transport: 'TCP' | 'UDP'
    logs: boolean
}