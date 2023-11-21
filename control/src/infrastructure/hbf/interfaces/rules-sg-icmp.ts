export interface ISgIcmpRulesReq {
    sg: string[]
}

export interface ISgIcmpRules {
    rules: ISgIcmpRule[]
}

export interface ISgIcmpRule {
    ICMP: {
        IPv: "IPv4" | "IPv6"
        Types: number[]
    },
    Sg: string
    logs: boolean
    trace: boolean
}