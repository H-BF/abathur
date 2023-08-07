import { ControlServer } from "./src/domain/grpc/control";
import { HBFDataCollector } from "./src/domain/hbf";
import { waitSetSize } from "./src/domain/helpers";
import { PSCFabric } from "./src/domain/k8s/PSCFabric";
import { PodStatus } from "./src/domain/k8s/enums";
import { PodInformer } from "./src/domain/k8s/podInformer";

(async () => {
    console.log("Hi!")
    
    const manager = new PSCFabric()
    const podInf = new PodInformer()
    podInf.create()
    podInf.start()

    await manager.createSharedConfigMaps()
    await manager.createHBFServer()

    await podInf.waitStatus(`p${process.env.PIPELINE_ID}-hbf-server`, PodStatus.RUNNING)
    await delay(10000)

    const hbf = new HBFDataCollector()
    const hbfData =  await hbf.collect()
    const keys = Object.keys(hbfData)

    const control = new ControlServer("b05ac270-6635-4895-9271-8094989b2ccd", keys.length)
    control.start()

    for (let i = 0; i < keys.length; i++) {
        await manager.createTestPod(i, keys[i], JSON.stringify(hbfData[keys[i]]))
    }

    console.log(control.getStreamList())

    await waitSetSize(control.getStreamList(), 0, 3_600_000, 300_000)
    
    await manager.destroyAllByInstance()
})();

function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
}