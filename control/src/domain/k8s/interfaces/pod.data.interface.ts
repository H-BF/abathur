import { PodConditionStatus } from "../types/pod.condition.status.type"

export interface IPodData {
    podStatus: string,
    containersReady?: {
        status: PodConditionStatus,
        date: Date
    }
}