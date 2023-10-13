export type TestData = Record<string, IData[]>

export interface IData {
    sgFrom: string
    to: string
    transport: string
    dst: string[]
    ports: IPorts[]
}


export interface IPorts {
    srcPorts: string[]
    dstPorts: string[]
}

export interface IResults {
    duration: number
    node: string
    results: IResult[]
}

export interface IResult {
    sgFrom: string
    to: string
    srcIp: string
    srcPort: string
    dst: string
    dstPort: string
    protocol: string
    status: string
    msgErr?: string
}