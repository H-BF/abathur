export type PortsForServers = Record<string, IPortsToServer>

export interface IPortsToServer {
    TCP: string[]
    UDP: string[]
}
