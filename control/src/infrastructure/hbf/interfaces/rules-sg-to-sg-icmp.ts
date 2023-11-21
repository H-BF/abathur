export interface ISgToSgIcmpRulesReq {
    sgFrom: string[]
    sgTo: string[]
}

export interface ISgToSgIcmpRules {
    rules: ISgToSgIcmpRule[]
}

export interface ISgToSgIcmpRule {
    ICMP: {
        IPv: "IPv4" | "IPv6"
        Types: number[]
    }
    SgFrom: string
    SgTo: string
    logs: boolean
    trace: boolean
}