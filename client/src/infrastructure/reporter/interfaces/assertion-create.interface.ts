export interface IAssertionCreateReq {
    launchUUID: string
    srcIp: string
    srcPort: string
    dstIp: string
    dstPort: string
    protocol: Protocol
    sgFrom: string
    sgTo: string
    status: AssertionStatus
    msgErr?: string | null
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