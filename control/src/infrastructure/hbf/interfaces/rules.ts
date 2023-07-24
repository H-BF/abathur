export interface IRulesReq {
    sgFrom: string[]
    sgTo: string[]
}

export interface IRules {
    rules: IRule[]
}

export interface IRule {
    ports: IRulePorts[]
    sgFrom: string
    sgTo: string
    transport: string
}

export interface IRulePorts {
    d: string
    s: string
}