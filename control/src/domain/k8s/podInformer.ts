import { variables } from "../../infrastructure/var_storage/variables-storage";
import { IPodData } from "./interfaces/pod.data.interface";
import { PodConditionTypes, PodStatus } from "./enums";
import { logger } from "../logger/logger.service";
import { V1Pod } from "@kubernetes/client-node"
import { BaseInformer } from "./baseInformer";

class PodInformer extends BaseInformer {

    private podDataRecord: Record<string, IPodData> = {}

    constructor() {
        super(variables.get("NAMESPACE"))
    }

    async create(): Promise<void> {
       logger.info('[MAIN] Создаем информер отслеживающий поды')
        const informer = this.k8sClient.createInformer(
            '/api/v1/namespaces/{namespace}/pods',
             async () => {
                return await this.k8sClient.getPodList()
            }
        )

        informer.on('add', (pod: V1Pod) => {           
            this.addToPodDataRecord(pod)
        })

        informer.on('update', (pod: V1Pod) => {
            this.addToPodDataRecord(pod)
        })

        informer.on('delete', (pod: V1Pod) => {
            this.deleteFromPodDataRecord(pod)
        })

        this.informer = informer
    }

    async waitStatus (
        podName: string,
        status: PodStatus,
        context: string,
        timeout: number = 60000,
        frequency: number = 1000
    ): Promise<void> {
        return new Promise( (resolve, reject) => {
            logger.info(`[${context}] Ждем у Pod'а ${podName} статус ${status}`)
            const startTime = Date.now()
            const interval = setInterval(() => {
                if(this.podDataRecord[podName].podStatus === status) {
                    logger.info(`[${context}] Дождались статус ${status} у пода ${podName}!`)
                    clearInterval(interval)
                    resolve()
                } else if (Date.now() - startTime >= timeout) {
                    clearInterval(interval)
                    reject(new Error(`[${context}] Timeout occurred!!`))
                }

            }, frequency)            
        })
    }

    async waitContainerIsReady(
        podName: string,
        context: string,        
        timeout: number = 30000,
        frequency: number = 1000
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            logger.info(`[${context}] Ждем у пода ${podName} состояние ContainersReady True`)
            const startTime = Date.now()
            const interval = setInterval(() => {
                if(this.podDataRecord[podName].containersReady?.status == 'True') {
                    logger.info(`[${context}] Дождались состояние ContainersReady True у пода ${podName}!`)
                    clearInterval(interval)
                    resolve()
                } else if (Date.now() - startTime >= timeout) {
                    clearInterval(interval)
                    reject(new Error(`Не дождались для пода ${podName} состояние ContainersReady = True за отведенные ${timeout} мсек`))
                }
            }, frequency)
        })
    }

    private addToPodDataRecord(pod: V1Pod) {

        let ready = undefined
        const name = this.k8sClient.getMetaName(pod.metadata)
        const status = this.k8sClient.getPodStatus(pod.status)
        
        if (pod.status && pod.status.conditions) {
            ready = this.k8sClient.getPodConditionStatus(
                PodConditionTypes.CONTAINERS_READY, 
                pod.status.conditions
        )}

        this.podDataRecord[name] = {
            podStatus: status,
            containersReady: ready
        }
    }

    private deleteFromPodDataRecord(pod: V1Pod) {
        delete this.podDataRecord[this.k8sClient.getMetaName(pod.metadata)]
    }
}

export const podInf = new PodInformer()