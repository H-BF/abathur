import { K8sClient } from "../../infrastructure/k8s/k8sClient";

export class K8sController {
 
    private k8sClient: K8sClient;

    constructor(namespace: string = 'default') {
        this.k8sClient = new K8sClient(namespace)
    }    
}