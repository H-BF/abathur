export interface INetworksReq {
    neteworkNames?: string[]
}

export interface INetworks {
    networks: INetwork[]
}

export interface INetwork {
    name: string
    network: {
        CIDR: string
    }
}