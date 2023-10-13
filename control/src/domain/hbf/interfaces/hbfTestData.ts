export type IHBFTestData = Record<string, IData[]>

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