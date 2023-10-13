export interface IRules {
    rules: IRule[]
}

export interface IRule {
    ports: IRulePorts[]
    sgFrom: string
    to: string
    transport: string
    logs: boolean
}

export interface IRulePorts {
    d: string
    s: string
}