export type TestData = Record<string, IData[]>

export interface IData {
    protocol: string
    dstIps: string[]
    rules: IRule[]
}

export interface IRule {
    srcPorts: string[]
    dstPorts: string[]
}

export interface IResults{
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
    msg: string
}