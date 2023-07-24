import { V1ConfigMap, V1Pod, V1Service } from "@kubernetes/client-node";
import { HBFDataCollector, HBFServer } from "./src/domain/hbf";
import { K8sClient } from "./src/infrastructure/k8s/k8sClient";
import { abaTestPod } from "./src/specifications/abaTestPod";
import { testData } from "./src/domain/testData/generator";

(async () => {
    console.log("Hi!")
    
    const hbfServer = new HBFServer()

    await hbfServer.start()

    await delay(10000)
    await testData.generate()

    const hbf = new HBFDataCollector()
    const hbfData =  await hbf.collect()

    const client = new K8sClient('default')
    await client.createConfigMap(abaTestPod.specConfMapHbfClient)
    await client.createConfigMap(abaTestPod.specConfMapNginx)

    const keys = Object.keys(hbfData)

    for (let i = 0; i < keys.length; i++) {
        await client.createConfigMap(abaTestPod.testData({
            name: `test-data-${i}`,
            lname: `test-data-${i}`,
            testData: JSON.stringify(hbfData[keys[i]])
        }) as V1ConfigMap)

        const pod = abaTestPod.specPod({
            podName: `test-pod-${i}`,
            labelName: `test-pod-${i}`,
            ip: keys[i],
            testData: `test-data-${i}`
        }) as V1Pod
        await client.createPod(pod)
    }

    // await hbfServer.stop()
})();

function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
}