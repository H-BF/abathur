export type TestDataRecord = Record<string, TestDataType[]>
export type TestDataType = ITcpUdpTestData | IIcmpTestData

export interface ITcpUdpTestData {
    from: string
    to: string
    fromType: DirectionType 
    toType: DirectionType
    transport: 'TCP' | 'UDP'
    traffic: "Ingress" | "Egress" | "unknown"
    dst: string[]
    ports: IPorts[]
}

export interface IIcmpTestData {
    from: string
    to: string
    dst: string[]
    IPv: "IPv4" | "IPv6"
    traffic: "Ingress" | "Egress" | "unknown"
    types: string[]
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