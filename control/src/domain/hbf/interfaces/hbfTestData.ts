export type IHBFTestData = Record<string, IData[]>

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