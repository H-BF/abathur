import { IRulePorts } from "./rules"

export interface ISgToSgIETcpUdpRulesReq {
    Sg: string[],
    SgLocal: string[]
}

export interface ISgToSgIETcpUdpRules {
    rules: ISgToSgIETcpUdpRule[]
}

export interface ISgToSgIETcpUdpRule {
    Sg: string,
    SgLocal: string,
    traffic: 'Ingress' | 'Egress'
    transport: 'TCP' | 'UDP'
    ports: IRulePorts[]
    logs: boolean
    trace: boolean
}