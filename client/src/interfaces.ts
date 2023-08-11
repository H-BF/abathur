export type TestData = Record<string, IData[]>

export interface IData {
    sgFrom: string
    sgTo: string
    transport: string
    dstIps: string[]
    ports: IPorts[]
}


export interface IPorts {
    srcPorts: string[]
    dstPorts: string[]
}

export interface IResults{
    duration: number
    node: string
    results: IResult[]
}

export interface IResult {
    sgFrom: string
    sgTo: string
    srcIp: string
    srcPort: string
    dstIp: string
    dstPort: string
    protocol: string
    status: string
    msgErr?: string
}