import { V1ConfigMap, V1Pod, V1Service } from "@kubernetes/client-node";
import { K8sClient } from "../../infrastructure/k8s/k8sClient";
import { abaTestPod } from "../../specifications/abaTestPod";
import { hbfServer } from "../../specifications/hbfServer";
import { variables } from "../../infrastructure/var_storage/variables-storage";

export class PSCFabric {
 
    private k8sClient: K8sClient;

    constructor() {
        this.k8sClient = new K8sClient(variables.get("NAMESPACE"))
    }

    /**
     * Создаем конфиг мапы, которые будут общими дня всех подов:
     * - конфиг HBF сервера
     * - конфиг HBF клиента
     * - конфиг Nginx
     */
    async createSharedConfigMaps(maps: V1ConfigMap[]) {
        for (const map of maps) {
            await this.k8sClient.createConfigMap(map)
        }
    }

    /**
     * Создаем под HBF сервера и сервис над ним.
     * Важно! Сначало надо вызвать метод createSharedConfigMaps()
     */
    async createHBFServer(prefix: string) {
        await this.k8sClient.createPod(hbfServer.specPod({prefix: prefix}) as V1Pod)
        await this.k8sClient.createService(hbfServer.specSrv({prefix: prefix}) as V1Service)
    }


    /**
     * Создаем ConfigMap с тестовыми данными для соответствующего пода.
     * Потом создаем сам под
     * Важно! Сначало надо вызвать метод createSharedConfigMaps()
     * @param podNumber - уникальный индитефикатор пода
     * @param ip - присваемый поду IP
     * @param testData - тестовые данные, которые надо поместить в ConfigMap
     * @param ports - список портов на которых нужно поднять сервер на данном поде
     */
    async createTestPod(
        prefix: string,
        podNumber: number,
        ip: string, 
        testData: string,
        ports: string
    ) {
        //Создаем configMap с тестовыми данными
        await this.k8sClient.createConfigMap(abaTestPod.testData({
            prefix: prefix,
            name: `test-data-${podNumber}`,
            component: `test-data-${podNumber}`,
            testData: testData
        }) as V1ConfigMap)

        //Создаем configMap с портами на открытие
        await this.k8sClient.createConfigMap(abaTestPod.ports({
            prefix: prefix,
            name: `test-ports-${podNumber}`,
            component: `test-ports-${podNumber}`,
            ports: ports
        }) as V1ConfigMap)

        await this.k8sClient.createPod(abaTestPod.specPod({
            prefix: prefix,
            podName: `test-pod-${podNumber}`,
            component: `test-pod-${podNumber}`,
            ip: ip,
            testData: `test-data-${podNumber}`,
            ports: `test-ports-${podNumber}`
        }) as V1Pod)
    }

    /**
     * Удаляем все Поды, Сервисы, Деплойменты, Сервис аккаунты, роли и Конфиг мапы по лейблу instance
     * Данный лейбл заполняется номером запустившего тесты пайплайны из env
     */
    async destroyAllByInstance(prefix: string) {
        await this.k8sClient.deleteAllsvcBylabel(`instance=${prefix}-p${variables.get("PIPELINE_ID")}`)
        await this.k8sClient.deleteAllPodByLabel(`instance=${prefix}-p${variables.get("PIPELINE_ID")}`)
        await this.k8sClient.deleteAllConfMapBylabel(`instance=${prefix}-p${variables.get("PIPELINE_ID")}`)
        await this.k8sClient.deleteServiceAccountByLabel(`instance=${prefix}-p${variables.get("PIPELINE_ID")}`)
        await this.k8sClient.deleteClusterRoleBindingByLabel(`instance=${prefix}-p${variables.get("PIPELINE_ID")}`)
        await this.k8sClient.deleteAllDeploymentByLabel(`instance=${prefix}-p${variables.get("PIPELINE_ID")}`)
    }

    async destroyAbathur() {
        await this.k8sClient.deleteAllPodByLabel(`instance=p${variables.get("PIPELINE_ID")}-abathur-control`)
    }
}

export const manager = new PSCFabric()