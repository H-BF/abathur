export type TestDataRecord = Record<string, TestDataType[]>
export type TestDataType = ITcpUdpTestData | IIcmpTestData


export interface IConfigMapTestData {
    scenario: string,
    testData: TestDataType[]
}

export interface ITcpUdpTestData {
    from: string
    to: string
    fromType: DirectionType 
    toType: DirectionType
    transport: 'TCP' | 'UDP'
    traffic: "Ingress" | 'Egress' | 'unknown'
    dst: string[]
    ports: IPorts[]
}

export interface IIcmpTestData {
    from: string
    to: string
    dst: string[]
    IPv: "IPv4" | "IPv6"
    traffic: "Ingress" | 'Egress' | 'unknown'
    types: string[]
}

export interface IPorts {
    srcPorts: string[]
    dstPorts: string[]
}

export interface IResults {
    duration: number
    node: string
    results: TResult[]
}

export enum DirectionType {
    FQDN = 'fqdn',
    CIDR = 'cidr',
    SG = 'sg'
}

//////////////////////
///////Results////////
//////////////////////
export type TResult = ITcpUdpResult | IIcmpResult

export interface ITcpUdpResult {
    from: string
    to: string
    fromType: DirectionType 
    toType: DirectionType
    srcIp: string
    srcPort: string
    dstIp: string
    dstPort: string
    protocol: 'tcp' | 'udp'
    traffic: 'ingress' | 'egress' | 'unknown'
    status: string
    msgErr?: string
}

export interface IIcmpResult {
    from: string
    to: string
    fromType: DirectionType 
    toType: DirectionType
    srcIp: string
    dstIp: string
    protocol: 'icmp'
    traffic: 'ingress' | 'egress' | 'unknown'
    icmpType: string[]
    icmpCommand: string
    status: string
    msgErr?: string
}