import { V1Pod } from "@kubernetes/client-node"
import { BaseInformer } from "./baseInformer";
import { PodStatus } from "./enums";

export class PodInformer extends BaseInformer {

    constructor(namespace: string = 'default') {
        super(namespace)
    }

    async create(): Promise<void> {
        const informer = this.k8sClient.createInformer('/api/v1/namespaces/{namespace}/pods', async () => {
            return await this.k8sClient.getPodList()
        })

        informer.on('add', (pod: V1Pod) => {
            this.statusRecord[this.k8sClient.getName(pod.metadata)] = this.k8sClient.getStatus(pod.status)              
        })

        informer.on('update', (pod: V1Pod) => {
            this.statusRecord[this.k8sClient.getName(pod.metadata)] = this.k8sClient.getStatus(pod.status)
        })

        informer.on('delete', (pod: V1Pod) => {
            delete this.statusRecord[this.k8sClient.getName(pod.metadata)]
        })

        this.informer = informer
    }

    async waitStatus (
        name: string,
        status: PodStatus,
        timeout: number = 60000,
        frequency: number = 1000
    ): Promise<void> {
        return new Promise( (resolve, reject) => {
            const startTime = Date.now()
            const interval = setInterval(() => {
                if(this.statusRecord[name] === status) {
                    clearInterval(interval)
                    resolve()
                } else if (Date.now() - startTime >= timeout) {
                    clearInterval(interval)
                    reject(new Error("Timeout occurred!!"))
                }

            }, frequency)            
        })
    }
}