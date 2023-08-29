import { ControlServer } from "./src/domain/grpc/control";
import { HBFDataCollector } from "./src/domain/hbf";
import { waitSetSize } from "./src/domain/helpers";
import { manager } from "./src/domain/k8s/PSCFabric";
import { PodStatus } from "./src/domain/k8s/enums";
import { podInf } from "./src/domain/k8s/podInformer";
import { Reporter } from "./src/domain/reporter/reporter";
import { LaunchStatus } from "./src/infrastructure/reporter";
import { variables } from "./src/infrastructure/var_storage/variables-storage";

(async () => {

    const reporter = new Reporter()
    await reporter.createLaunch(variables.get("PIPELINE_ID"), variables.get("JOB_ID"))

    try {
        const startTime = Date.now()

        await podInf.create()
        podInf.start()
    
        await manager.createSharedConfigMaps()
        await manager.createHBFServer()
    
        await podInf.waitStatus(`p${variables.get("PIPELINE_ID")}-hbf-server`, PodStatus.RUNNING)
        await delay(10000)
    
        const hbf = new HBFDataCollector()
        await hbf.collect()
        const hbfTestData = hbf.getTestData()
        const ports = hbf.gePortsForServer()
    
        const keys = Object.keys(hbfTestData)
        const control = new ControlServer(reporter.launchUUID, keys.length)
        control.start()
    
        for (let i = 0; i < keys.length; i++) {
            await manager.createTestPod(
                i,
                keys[i],
                JSON.stringify(hbfTestData[keys[i]]),
                JSON.stringify(ports[keys[i]])
            )
        }
    
        await waitSetSize(control.getStreamList(), keys.length, 3_600_000, 5)
        await reporter.setStauts(LaunchStatus.IN_PORCESS)

        await waitSetSize(control.getStreamList(), 0, 3_600_000, 1_000)

        await manager.destroyAllByInstance()

        await reporter.closeLaunch(control.failCount, control.passCount, Date.now() - startTime)
    } catch (err) {
        await reporter.closeLaunchWithError(`${err}`)
    }
})();

function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
}