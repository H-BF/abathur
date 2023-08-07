import { V1ConfigMap, V1Pod } from "@kubernetes/client-node";
import { K8sClient } from "../../infrastructure/k8s/k8sClient";
import { abaTestPod } from "../../specifications/abaTestPod";
import { hbfServer } from "../../specifications/hbfServer";

export class PSCFabric {
 
    private k8sClient: K8sClient;

    constructor(namespace: string = 'default') {
        this.k8sClient = new K8sClient(namespace)
    }

    /**
     * Создаем конфиг мапы, которые будут общими дня всех подов:
     * - конфиг HBF сервера
     * - конфиг HBF клиента
     * - конфиг Nginx
     */
    async createSharedConfigMaps() {
        await this.k8sClient.createConfigMap(hbfServer.hbfConfMap)
        await this.k8sClient.createConfigMap(hbfServer.pgConfMap)
        await this.k8sClient.createConfigMap(abaTestPod.specConfMapHbfClient)
        await this.k8sClient.createConfigMap(abaTestPod.specConfMapNginx)
    }

    /**
     * Создаем под HBF сервера и сервис над ним.
     * Важно! Сначало надо вызвать метод createSharedConfigMaps()
     */
    async createHBFServer() {
        await this.k8sClient.createPod(hbfServer.specPod)
        await this.k8sClient.createService(hbfServer.specSrv)
    }


    /**
     * Создаем ConfigMap с тестовыми данными для соответствующего пода.
     * Потом создаем сам под
     * Важно! Сначало надо вызвать метод createSharedConfigMaps()
     * @param podNumber - уникальный индитефикатор пода
     * @param ip - присваемый поду IP
     * @param testData - тестовые данные, которые надо поместить в ConfigMap
     */
    async createTestPod(
        podNumber: number,
        ip: string, 
        testData: string
    ) {
        await this.k8sClient.createConfigMap(abaTestPod.testData({
            name: `test-data-${podNumber}`,
            component: `test-data-${podNumber}`,
            testData: testData
        }) as V1ConfigMap)
        await this.k8sClient.createPod(abaTestPod.specPod({
            podName: `test-pod-${podNumber}`,
            component: `test-pod-${podNumber}`,
            ip: ip,
            testData: `test-data-${podNumber}`
        }) as V1Pod)
    }

    /**
     * Удаляем все Поды, Сервисы и Конфиг мапы по лейблу instance
     * Данный лейбл заполняется номером запустившего тесты пайплайны из env
     */
    async destroyAllByInstance() {
        await this.k8sClient.deleteAllsvcBylabel(`instance=p${process.env.PIPELINE_ID}`)
        await this.k8sClient.deleteAllPodByLabel(`instance=p${process.env.PIPELINE_ID}`)
        await this.k8sClient.deleteAllConfMapBylabel(`instance=p${process.env.PIPELINE_ID}`)
    }
}