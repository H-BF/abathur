import { DirectionType } from "../../../domain/interfaces"

export interface ITcpUdpAssertionCreateReq {
    launchUUID: string
    srcIp: string
    srcPort: string
    dstIp: string
    dstPort: string
    protocol: Protocol
    from: string
    to: string
    fromType: DirectionType 
    toType: DirectionType
    status: AssertionStatus
    msgErr?: string | null
    testName: string
    traffic: string
}

export interface IIcmpAssertionCreateReq {
    launchUUID: string
    srcIp: string
    dstIp: string
    protocol: Protocol
    from: string
    to: string
    fromType: DirectionType 
    toType: DirectionType
    status: AssertionStatus
    icmpType: string,
    icmpCommand: string,
    msgErr?: string | null
    testName: string
    traffic: string
}

export interface IAssertionsCreateRes {
    count: string
}

export enum Protocol {
    TCP = 'TCP',
    UDP = 'UDP',
    ICMP = 'ICMP'
}

export enum AssertionStatus {
    PASS = 'pass',
    FAIL = 'fail'
 }