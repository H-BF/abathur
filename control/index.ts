import { HBFDataCollector } from "./src/domain/hbf";
import { PSCFabric } from "./src/domain/k8s/PSCFabric";
import { PodStatus } from "./src/domain/k8s/enums";
import { PodInformer } from "./src/domain/k8s/podInformer";
import { testData } from "./src/domain/testData/generator";

(async () => {
    console.log("Hi!")
    
    const manager = new PSCFabric()
    const podInf = new PodInformer()

    await podInf.create()
    podInf.start()

    await manager.createSharedConfigMaps()
    await manager.createHBFServer()

    await podInf.waitStatus('hbf-server', PodStatus.RUNNING)

    console.log("Дождались!")

    await delay(10000)
    await testData.generate()

    const hbf = new HBFDataCollector()
    const hbfData =  await hbf.collect()

    const keys = Object.keys(hbfData)
    for (let i = 0; i < keys.length; i++) {
        await manager.createTestPod(i, keys[i], JSON.stringify(hbfData[keys[i]]))
    }

    await delay(60000)

    await manager.destroyAllByInstance()
})();

function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
}