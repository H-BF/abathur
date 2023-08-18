export interface IUpdateLaunchReq {
    uuid: string
    failCount?: number
    passCount?: number
    duration?: number
    status?: LaunchStatus
}

export interface IUpdateLaunchRes {
    uuid: string
    date: Date
    pipeline: number
    fail_count: number | null
    pass_count: number | null
    duration: number | null
    status: LaunchStatus
}

export enum LaunchStatus {
    CREATE = 'create',
    IN_PORCESS = 'in_process',
    FINISH = 'finish',
    ERROR = 'error'
}