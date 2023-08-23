export interface ICreateLaunchReq {
    pipeline: number,
    job: number
}

export interface ICreateLaunchRes {
    uuid: string
}