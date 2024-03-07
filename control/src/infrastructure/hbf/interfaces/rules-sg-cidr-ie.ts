import { IRulePorts } from "./rules"

export interface ISgToCidrIETcpUdpRulesReq {
    sg: string[]
}

export interface ISgToCidrIETcpUdpRules {
    rules: ISgToCidrIETcpUdpRule[]
}

export interface ISgToCidrIETcpUdpRule {
    CIDR: string,
    SG: string,
    transport: 'TCP' | 'UDP'
    ports: IRulePorts[]
    traffic: 'Ingress' | 'Egress'
    logs: boolean
    trace: boolean
}