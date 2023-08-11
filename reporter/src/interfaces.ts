export interface IResults {
    duration: number
    node: string
    results: IResult[]
}

export interface IResult {
    srcIp: string
    srcPort: string
    dstIp: string
    dstPort: string
    protocol: string
    status: string
    msgErr?: string
}