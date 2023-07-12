export interface ISecurityGroupsReq {
    sgNames?: string[]
}

export interface ISecurityGroups {
    groups: ISecurityGroup[]
}

export interface ISecurityGroup {
    name: string
    networks: string[]
}