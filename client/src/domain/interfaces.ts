export type TestData = Record<string, IData[]>

export interface IData {
    from: string
    to: string
    fromType: DirectionType 
    toType: DirectionType
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
    from: string
    to: string
    fromType: DirectionType 
    toType: DirectionType
    srcIp: string
    srcPort: string
    dstIp: string
    dstPort: string
    protocol: string
    status: string
    msgErr?: string
}

export enum DirectionType {
    FQDN = 'fqdn',
    CIDR = 'cidr',
    SG = 'SG'
}