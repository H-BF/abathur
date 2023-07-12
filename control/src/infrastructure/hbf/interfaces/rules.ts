export interface IRulesReq {
    sgFrom: string[]
    sgTo: string[]
}

export interface IRules {
    rules: IRule[]
}

export interface IRule {
    ports: [
        {
            d: string
            s: string
        }
    ]
    sgFrom: string
    sgTo: string
    transport: string
}