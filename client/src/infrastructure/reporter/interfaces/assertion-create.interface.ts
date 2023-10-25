import { DirectionType } from "../../../domain/interfaces"

export interface IAssertionCreateReq {
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
}

export interface IAssertionsCreateRes {
    count: string
}

export enum Protocol {
    TCP = 'tcp',
    UDP = 'udp'
}

export enum AssertionStatus {
    PASS = 'pass',
    FAIL = 'fail'
 }