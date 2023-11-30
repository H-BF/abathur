import { variables } from "../../infrastructure/var_storage/variables-storage";
import { IServiceData } from "./interfaces/svc.data.interface";
import { V1Service } from "@kubernetes/client-node";
import { logger } from "../logger/logger.service";
import { BaseInformer } from "./baseInformer";

class SvcInformer extends BaseInformer {

    private svcDataRecord: Record<string, IServiceData> = {}

    constructor() {
        super(variables.get("NAMESPACE"))
    }

    async create(): Promise<void> {
        logger.info('[MAIN] Создаем информер отслеживающий сервисы')
        const informer = this.k8sClient.createInformer(
            '/api/v1/namespaces/{namespace}/services',
            async() => {
                return await this.k8sClient.getSvcList()
            }
        )

        informer.on('add', (svc: V1Service) => {
            this.addToSvcDataRecord(svc)
        })

        informer.on('update', (svc: V1Service) => {
            this.addToSvcDataRecord(svc)
        })

        informer.on('delete', (svc: V1Service) => {
            this.deleteFromSvcDataRecord(svc)
        })

        this.informer = informer
    }

    waitUntilDataIsMissing(
        svcName: string,
        timeout: number = 30000,
        frequency: number = 1000
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const startTime = Date.now()
            const interval = setInterval(() => {
                if (!(svcName in Object.keys(this.svcDataRecord))) {
                    clearInterval(interval)
                    resolve()
                } else if (Date.now() - startTime >= timeout) {
                    clearInterval(interval)
                    reject(new Error(`Не дождались отсутствия сервиса '${svcName}' в списке`))
                }
            }, frequency)
        })
    }

    waitClusterIpForSvc(
        svcName: string,
        timeout: number = 30000,
        frequency: number = 1000
    ): Promise<void> {
        logger.info(`Ждем назначение clusterIP для сервиса: ${svcName}`)
        return new Promise((resolve, reject) => {
            const startTime = Date.now()
            const interval = setInterval(() => {
                if (typeof this.svcDataRecord[svcName].clusterIP === 'string') {
                    clearInterval(interval)
                    resolve()
                } else if (Date.now() - startTime >= timeout) {
                    clearInterval(interval)
                    reject(new Error(`Не дождались наличия clusterIP у сервиса '${svcName}'`))
                }
            }, frequency)           
        })
    }

    private addToSvcDataRecord(svc: V1Service) {
        const name = this.k8sClient.getMetaName(svc.metadata)
        const clusterIP = this.k8sClient.getSvcClusterIP(svc.spec)

        this.svcDataRecord[name] = {
            clusterIP: clusterIP
        }
    }

    private deleteFromSvcDataRecord(svc: V1Service) {
        delete this.svcDataRecord[this.k8sClient.getMetaName(svc.metadata)]
    }
}

export const svcInf = new SvcInformer()