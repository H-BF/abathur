import { K8sClient } from "../../infrastructure/k8s/k8sClient"
import { hbfServer } from "../../specifications/hbfServer";


export class HBFServer {

    private k8sClient: K8sClient;
    private configMapName: string | undefined;
    private podName: string | undefined;
    private srvName: string | undefined;

    constructor() {
        this.k8sClient = new K8sClient('default')
    }

    async start() {
        this.configMapName = await this.k8sClient.createConfigMap(hbfServer.specConfMap)
        this.podName = await this.k8sClient.createPod(hbfServer.specPod)
        this.srvName = await this.k8sClient.createService(hbfServer.specSrv)
    }

    async stop() {
        if (this.configMapName === undefined) 
            throw new Error("ConfigMapName is undefind!")

        if (this.podName === undefined)
            throw new Error("podName is undefind!")

        if (this.srvName === undefined)
            throw new Error("srvName is undefind!")

        await this.k8sClient.deleteService(this.srvName)
        await this.k8sClient.deletePod(this.podName)
        await this.k8sClient.deleteConfigMap(this.configMapName)
    }
}