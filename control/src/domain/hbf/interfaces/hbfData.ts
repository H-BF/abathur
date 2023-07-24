export type IHBFData = Record<string, IData[]>

export interface IData {
    transport: string
    dstIps: string[]
    ports: IPorts[]
}

export interface IPorts {
    srcPorts: string[]
    dstPorts: string[]
}