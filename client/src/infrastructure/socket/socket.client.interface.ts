export interface ISocketClient {
    check: (srcPort: number, dstIp: string, dstPort: number) => Promise<string>
}