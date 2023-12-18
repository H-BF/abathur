import { IRulePorts } from "./rules"

export interface ISgToCidrIERulesReq {
    sg: string[]
}

export interface ISgToCidrIERules {
    rules: ISgToCidrIERule[]
}

export interface ISgToCidrIERule {
    CIDR: string,
    SG: string,
    transport: 'TCP' | 'UDP'
    ports: IRulePorts[]
    traffic: 'Ingress' | 'Egress'
    logs: boolean
    trace: boolean
}