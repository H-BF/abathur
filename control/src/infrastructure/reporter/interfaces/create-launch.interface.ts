export interface ICreateLaunchReq {
    pipeline: number,
    job: number,
    srcBranch: string,
    commit: string,
    tag: string
    serviceName: string
}

export interface ICreateLaunchRes {
    uuid: string
}