export interface ICreateLaunchReq {
    pipeline: number,
    job: number,
    srcBranch: string,
    dstBranch: string,
    commit: string,
    hbfTag: string
}

export interface ICreateLaunchRes {
    uuid: string
}