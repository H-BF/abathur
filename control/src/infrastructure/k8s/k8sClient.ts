import { KubeConfig, CoreV1Api, V1Pod, V1Service, V1ConfigMap, V1ObjectMeta  } from '@kubernetes/client-node';

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

    private getName(metadata: V1ObjectMeta | undefined): string {
        if(!metadata) 
            throw new Error("Metadata is missing!")
        if(!metadata.name)
            throw new Error("Field 'name' in metadata is missing!")
        return metadata.name
    }

    async createPod(podSpec: V1Pod): Promise<string> {
        try {
            const { response, body } = await this.coreAPI.createNamespacedPod(this.namespace, podSpec)
            console.log("code: " + response.statusCode)
            return this.getName(body.metadata) 
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deletePod(podName: string) {
        try {
            const { response } = await this.coreAPI.deleteNamespacedPod(podName, this.namespace)
            console.log("code: " + response.statusCode)
        } catch(err) {
            console.log(err)
        }
    }

    async createService(scvSpec: V1Service): Promise<string> {
        try {
            const { response, body } = await this.coreAPI.createNamespacedService(this.namespace, scvSpec)
            console.log("code: " + response.statusCode)
            return this.getName(body.metadata) 
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deleteService(srvName: string) {
        try {
            const { response } = await this.coreAPI.deleteNamespacedService(srvName, this.namespace)
            console.log("code: " + response.statusCode)
        } catch(err) {
            console.log(err)
        }
    }

    async createConfigMap(configMap: V1ConfigMap): Promise<string> {
        try {
            const { response, body } = await this.coreAPI.createNamespacedConfigMap(this.namespace, configMap)
            console.log("code: " + response.statusCode)
            return this.getName(body.metadata)
        } catch (err) {
            console.log(err)
            throw new Error(`${err}`)
        }
    }

    async deleteConfigMap(confMapName: string) {
        try {
            const { response } = await this.coreAPI.deleteNamespacedConfigMap(confMapName, this.namespace)
            console.log("code: " + response.statusCode)
        } catch(err) {
            console.log(err)
        }
    }
}