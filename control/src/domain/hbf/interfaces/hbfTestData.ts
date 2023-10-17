export type IHBFTestData = Record<string, IData[]>

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

export enum DirectionType {
    FQDN = 'fqdn',
    CIDR = 'cidr',
    SG = 'sg'
}