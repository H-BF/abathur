export interface IResults {
    node: string
    results: IResult[]
}

export interface IResult {
    srcIp: string
    srcPort: string
    dstIp: string
    dstPort: string
    protocol: string
    msg: string
}