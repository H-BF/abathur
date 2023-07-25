import { KubeConfig, CoreV1Api, V1Pod, V1Service, V1ConfigMap, V1ObjectMeta, makeInformer, ListPromise, KubernetesObject, Informer, ObjectCache, V1PodList, V1PodStatus, V1ServiceList, V1ConfigMapList  } from '@kubernetes/client-node';
import http from 'http'

export class K8sClient {

    private config: KubeConfig
    private coreAPI: CoreV1Api
    private namespace: string

    constructor(namespace: string) {
        this.namespace = namespace
        this.config = new KubeConfig()
        this.config.loadFromDefault()
        this.coreAPI = this.config.makeApiClient(CoreV1Api);
    }

    getName(metadata: V1ObjectMeta | undefined): string {
        if(!metadata) 
            throw new Error("Metadata is missing!")
        if(!metadata.name)
            throw new Error("Field 'name' in metadata is missing!")
        return metadata.name
    }

    getStatus(status: V1PodStatus | undefined): string {
        if(!status) 
            throw new Error("Status is missing!")
        if(!status.phase)
            throw new Error("Field 'phase' in metadata is missing!")
        return status.phase
    }

        ///////////////////
        //Работа с подами//
        ///////////////////
    async getPodList(): Promise<{response: http.IncomingMessage; body: V1PodList;}> {
        try {
            console.log(`Получаем список подов для namespase: ${this.namespace}`)
            return await this.coreAPI.listNamespacedPod(this.namespace)
        } catch(err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async createPod(podSpec: V1Pod): Promise<string> {
        try {
            console.log(`Создаем Pod: ${this.getName(podSpec.metadata)}`)
            const { response, body } = await this.coreAPI.createNamespacedPod(this.namespace, podSpec)
            console.log(`Response code: ${response.statusCode}`)
            return this.getName(body.metadata) 
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deletePod(podName: string) {
        try {
            console.log(`Удаляем Pod: ${podName}`)
            const { response } = await this.coreAPI.deleteNamespacedPod(podName, this.namespace)
            console.log("Response code: " + response.statusCode)
        } catch(err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deleteAllPodByLabel(labelSelector: string) {
        try {
            console.log(`Удаляем все Pod'ы c label: ${labelSelector}`)
            const { response } = await this.coreAPI.deleteCollectionNamespacedPod(
                this.namespace,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                labelSelector
            )
            console.log(`Response code: ${response.statusCode}`)
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }

    }

        //////////////////////
        //Работа с сервисами//
        //////////////////////

    async getSvcList(): Promise<{response: http.IncomingMessage; body: V1ServiceList;}> {
        try {
            console.log(`Получаем список сервисов для namespase: ${this.namespace}`)
            return await this.coreAPI.listNamespacedService(this.namespace)
        } catch(err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }


    async createService(scvSpec: V1Service): Promise<string> {
        try {
            console.log(`Создаем сервис: ${this.getName(scvSpec.metadata)}`)
            const { response, body } = await this.coreAPI.createNamespacedService(this.namespace, scvSpec)
            console.log(`Response code: ${response.statusCode}`)
            return this.getName(body.metadata) 
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deleteService(srvName: string) {
        try {
            console.log(`Удаляем сервис: ${srvName}`)
            const { response } = await this.coreAPI.deleteNamespacedService(srvName, this.namespace)
            console.log(`Response code: ${response.statusCode}`)
        } catch(err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deleteAllsvcBylabel(labelSelector: string) {
        try {
            console.log(`Удаляем все сервисы c label: ${labelSelector}`)
            const { response } = await this.coreAPI.deleteCollectionNamespacedService(
                this.namespace,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                labelSelector
            )
            console.log(`Response code: ${response.statusCode}`)
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

        //////////////////////
        //Работа с конфигами//
        //////////////////////

    async getConfMapList(): Promise<{response: http.IncomingMessage; body: V1ConfigMapList;}> {
        try {
            console.log(`Получаем список ConfigMap для namespase: ${this.namespace}`)
            return await this.coreAPI.listNamespacedConfigMap(this.namespace)
        } catch(err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async createConfigMap(configMap: V1ConfigMap): Promise<string> {
        try {
            console.log(`Создаем ConfigMap: ${this.getName(configMap.metadata)}`)
            const { response, body } = await this.coreAPI.createNamespacedConfigMap(this.namespace, configMap)
            console.log(`Response code: ${response.statusCode}`)
            return this.getName(body.metadata)
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deleteConfigMap(confMapName: string) {
        try {
            console.log(`Удаляем ConfigMap: ${confMapName}`)
            const { response } = await this.coreAPI.deleteNamespacedConfigMap(confMapName, this.namespace)
            console.log(`Response code: ${response.statusCode}`)
        } catch(err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deleteAllConfMapBylabel(labelSelector: string) {
        try {
            console.log(`Удаляем все ConfigMap c label: ${labelSelector}`)
            const { response } = await this.coreAPI.deleteCollectionNamespacedConfigMap(
                this.namespace,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                labelSelector
            )
            console.log(`Response code: ${response.statusCode}`)
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    ////////////
    //INFORMER//
    ////////////

    createInformer<T extends KubernetesObject>(
        path: string,
        listPromiseFn: ListPromise<T>,
        labelSelector?: string,
        fieldSelector?: string
        ): Informer<T> & ObjectCache<T> {
        return makeInformer(this.config, path.replace('{namespace}', this.namespace), listPromiseFn, labelSelector, fieldSelector)
    }
}