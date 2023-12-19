import { V1ConfigMap, V1Pod, V1Service } from "@kubernetes/client-node";
import { K8sClient } from "../../infrastructure/k8s/k8sClient";
import { hbfTestStend } from "../../specifications/hbfTestStend";
import { newHbfServer } from "../../specifications/hbfServer";
import { variables } from "../../infrastructure/var_storage/variables-storage";
import { apiTestPod } from "../../specifications/apiTestPod";
import { logger } from "../logger/logger.service";
import { fqdnTestStend } from "../../specifications/fqdnTestStend";

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
    async createSharedConfigMaps(maps: V1ConfigMap[], context: string) {
        logger.info(`[${context}] Создаем общие configMaps`)
        for (const map of maps) {
            await this.k8sClient.createConfigMap(map)
        }
    }

    /**
     * Создаем под c HBF-DB сервера и сервис над ним.
     * Важно! Сначало надо вызвать метод createSharedConfigMaps()
     */
    async createHBFServerDB(prefix: string) {
        logger.info(`[${prefix}] Создаем pod hbf-server-db`)
        await this.k8sClient.createPod(newHbfServer.databasePod({
            prefix: prefix
        }) as V1Pod)
        logger.info(`[${prefix}] Создаем service hbf-server-db`)
        await this.k8sClient.createService(newHbfServer.databaseSvc({
            prefix: prefix
        }) as V1Service)        
    }

    /**
     * Создаем под HBF сервера и сервис над ним.
     * Важно! Сначало надо вызвать метод createSharedConfigMaps()
     */
    async createHBFServer(prefix: string, ip: string, port: string) {
        logger.info(`[${prefix}] Создаем pod hbf-server: {ip: ${ip}, port: ${port}}`)
        await this.k8sClient.createPod(newHbfServer.serverPod({
            prefix: prefix,
            ip: ip,
            port: parseInt(port)
        }) as V1Pod)
        logger.info(`[${prefix}] Создаем service hbf-server`)
        await this.k8sClient.createService(newHbfServer.serverSvc({prefix: prefix}) as V1Service)
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
    async createHBFTestStend(
        prefix: string,
        podNumber: number,
        ip: string, 
        testData: string,
        ports: string,
        isHbfClientInit: boolean = true
    ) {
        logger.info(`[${prefix}] Готовимся к созданию тестового пода ${podNumber}: ${ip}`)
        //Создаем configMap с тестовыми данными
        await this.k8sClient.createConfigMap(hbfTestStend.testData({
            prefix: prefix,
            name: `test-data-${podNumber}`,
            component: `test-data-${podNumber}`,
            testData: testData
        }) as V1ConfigMap)

        //Создаем configMap с портами на открытие
        await this.k8sClient.createConfigMap(hbfTestStend.ports({
            prefix: prefix,
            name: `test-ports-${podNumber}`,
            component: `test-ports-${podNumber}`,
            ports: ports
        }) as V1ConfigMap)

        if(isHbfClientInit) {
            await this.k8sClient.createPod(hbfTestStend.specPodHbfClientIsInitContainer({
                prefix: prefix,
                podName: `test-pod-${podNumber}`,
                component: `test-pod-${podNumber}`,
                ip: ip,
                testData: `test-data-${podNumber}`,
                ports: `test-ports-${podNumber}`
            }) as V1Pod)
        } else {
            await this.k8sClient.createPod(hbfTestStend.specPodHbfClientIsContainer({
                prefix: prefix,
                podName: `test-pod-${podNumber}`,
                component: `test-pod-${podNumber}`,
                ip: ip,
                testData: `test-data-${podNumber}`,
                ports: `test-ports-${podNumber}`
            }) as V1Pod)
        }
    }

    async createFQDNTestStend(
        prefix: string,
        fqdn: string,
        portsData: string,
        portsJSON: Object
    ) {
        await this.k8sClient.createConfigMap(fqdnTestStend.ports({
            prefix: prefix,
            name: fqdn,
            component: `${fqdn}-ports`,
            ports: portsData
        }) as V1ConfigMap)

        await this.k8sClient.createPod(fqdnTestStend.specPod({
            prefix: prefix,
            podName: fqdn,
            component: fqdn
        }) as V1Pod)

        await this.k8sClient.createService(fqdnTestStend.specSrv({
            prefix: prefix,
            podName: fqdn,
            component: fqdn,
            ports: portsJSON
        }) as V1Service)
    }

    async createFqdnService(
        prefix: string,
        fqdn: string,
        portsJSON: Object
    ) {
        await this.k8sClient.createService(fqdnTestStend.specSrv({
            prefix: prefix,
            podName: fqdn,
            component: fqdn,
            ports: portsJSON
        }) as V1Service)        
    }


    /**
     * Создаем тествоый под для API тестов
     */
    async createAPITestPod(
        prefix: string,
        ip: string
    ) {
        await this.k8sClient.createPod(apiTestPod.specPod({
            prefix: prefix,
            ip: ip
        }) as V1Pod)
    }

    /**
     * СОздаем тестовый стенд без HBF Agent
     */
    async createTestStend(
        prefix: string,
        podNumber: number,
        ip: string, 
        testData: string,
        ports: string,
    ) {
        logger.info(`[${prefix}] Готовимся к созданию тестового пода ${podNumber}: ${ip}`)
        //Создаем configMap с тестовыми данными
        await this.k8sClient.createConfigMap(hbfTestStend.testData({
            prefix: prefix,
            name: `test-data-${podNumber}`,
            component: `test-data-${podNumber}`,
            testData: testData
        }) as V1ConfigMap)

        //Создаем configMap с портами на открытие
        await this.k8sClient.createConfigMap(hbfTestStend.ports({
            prefix: prefix,
            name: `test-ports-${podNumber}`,
            component: `test-ports-${podNumber}`,
            ports: ports
        }) as V1ConfigMap)

        await this.k8sClient.createPod(hbfTestStend.specPodWithoutHBFAgent({
            prefix: prefix,
            podName: `test-pod-${podNumber}`,
            Comment: `test-pod-${podNumber}`,
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

    async destroySVC(svcName: string) {
        await this.k8sClient.deleteService(svcName)
    } 
}

export const manager = new PSCFabric()