import { Informer, ObjectCache, V1ConfigMap, V1Pod, V1Service } from "@kubernetes/client-node";
import { K8sClient } from "../../infrastructure/k8s/k8sClient";

export abstract class BaseInformer {

    protected k8sClient: K8sClient;
    protected informer: 
          Informer<V1Pod> & ObjectCache<V1Pod> 
        | Informer<V1Service> & ObjectCache<V1Service> 
        | Informer<V1ConfigMap> & ObjectCache<V1ConfigMap> 
        | undefined

    constructor(namespace: string) {
        this.k8sClient = new K8sClient(namespace)
    }

    abstract create(): Promise<void>

    start() {
        if(!this.informer)
            throw new Error("Informer not created")
        console.log("Запускаем под информер")
        this.informer.start()
    }

    stop(): void {
        if(!this.informer)
            throw new Error("Informer not created")
        this.informer.stop()
    }
}