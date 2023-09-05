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
        console.log("Создаем общие configMaps")
        for (const map of maps) {
            await this.k8sClient.createConfigMap(map)
        }
    }

    /**
     * Создаем под HBF сервера и сервис над ним.
     * Важно! Сначало надо вызвать метод createSharedConfigMaps()
     */
    async createHBFServer(prefix: string, ip: string) {
        console.log(`Создаем pod hbf-server: {prefix: ${prefix}, ip: ${ip}}`)
        await this.k8sClient.createPod(hbfServer.specPod({prefix: prefix, ip: ip}) as V1Pod)
        console.log(`Создаем service hbf-server`)
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
        console.log(`Готовимся к созданию тестового пода ${podNumber}: ${ip}`)
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
        const label = `instance=${prefix}-p${variables.get("PIPELINE_ID")}`
        await this.k8sClient.deleteAllsvcBylabel(label)
        await this.k8sClient.deleteAllPodByLabel(label)
        await this.k8sClient.deleteAllConfMapBylabel(label)
        await this.k8sClient.deleteServiceAccountByLabel(label)
        await this.k8sClient.deleteClusterRoleBindingByLabel(label)
        await this.k8sClient.deleteAllDeploymentByLabel(label)
    }

    async destroyAbathur() {
        const label = `instance=p${variables.get("PIPELINE_ID")}-abathur-control`
        await this.k8sClient.deleteAllJobByLabel(label)
        await this.k8sClient.deleteAllPodByLabel(label)
        await this.k8sClient.deleteAllConfMapBylabel(label)
    }
}

export const manager = new PSCFabric()