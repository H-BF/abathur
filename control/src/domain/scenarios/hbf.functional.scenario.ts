import { V1ConfigMap } from "@kubernetes/client-node"
import { hbfServer } from "../../specifications/hbfServer"
import { hbfTestPod } from "../../specifications/hbfTestPod"
import { variables } from "../../infrastructure/var_storage/variables-storage"
import { HBFReporter } from "../reporter/hbf.reporter"
import { manager } from "../k8s/PSCFabric"
import { podInf } from "../k8s/podInformer"
import { PodStatus } from "../k8s/enums"
import { HBFDataCollector } from "../hbf"
import { IHBFTestData, IPortForServer } from "../hbf/interfaces"
import { delay, waitSetSize } from "../helpers"
import { LaunchStatus } from "../../infrastructure/reporter"
import { streamFuncHandler } from "../grpc/stream.func.handler"
import fs from 'fs'
import path from 'path'
import { ScenarioInterface } from "./scenario.interface"

export class HBFFunctionalScenario implements ScenarioInterface {

    private prefix = 'func'
    private sharedConfigMaps: V1ConfigMap[] = []
    private hbfServerIP = variables.get("F_HBF_SERVER_IP")
    private hbfServerPort = variables.get("F_HBF_SERVER_PORT")

    private reporter: HBFReporter
    private finish: boolean = false

    constructor() {
        this.sharedConfigMaps.push(hbfServer.pgConfMap({
           prefix: this.prefix,
           data: fs.readFileSync(path.resolve(__dirname, "../../../sql/hbf.func.sql"), "utf-8")
            .replaceAll("HBF_REPORTER_HOST", variables.get("HBF_REPORTER_HOST"))
            .replaceAll("ABA_CONTROL_IP", variables.get("ABA_CONTROL_IP"))
            .replaceAll("HBF_REPORTER_PORT_FROM", variables.get("HBF_REPORTER_PORT"))
            .replaceAll("HBF_REPORTER_PORT_TO", (Number(variables.get("HBF_REPORTER_PORT")) + 1).toString())
            .replaceAll("ABA_CONTROL_PORT_FROM", variables.get("ABA_CONTROL_PORT"))
            .replaceAll("ABA_CONTROL_PORT_TO", (Number(variables.get("ABA_CONTROL_PORT")) + 1).toString())
        }) as V1ConfigMap)
        this.sharedConfigMaps.push(hbfServer.hbfConfMap({
            prefix: this.prefix,
            port: this.hbfServerPort
        }) as V1ConfigMap)
        this.sharedConfigMaps.push(hbfTestPod.specConfMapHbfClient({
            prefix: this.prefix,
            ip: this.hbfServerIP,
            port: this.hbfServerPort            
        }) as V1ConfigMap)
        this.sharedConfigMaps.push(hbfServer.specConfMapWaitDb({
            prefix: this.prefix            
        }) as V1ConfigMap)
        
        this.reporter = new HBFReporter()
    }

    async start() {
        try {
            console.log("HBF functional tests")
            const startTime = Date.now()
            await this.reporter.createLaunch(
                variables.get("PIPELINE_ID"),
                variables.get("JOB_ID"),
                variables.get("CI_SOURCE_BRANCH_NAME"),
                variables.get("CI_TARGET_BRANCH_NAME"),
                variables.get("COMMIT"),
                variables.get("HBF_TAG")
            )

            await manager.createSharedConfigMaps(this.sharedConfigMaps)
            await manager.createHBFServer(this.prefix, this.hbfServerIP, this.hbfServerPort)

            await podInf.waitStatus(
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                 PodStatus.RUNNING
            )
            await podInf.waitContainerIsReady(
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`
            )

           const { hbfTestData, ports } = await this.collectTestData()

           const keys = Object.keys(hbfTestData)
           streamFuncHandler.setHBFData(this.reporter.launchUUID, keys.length)

           for (let i = 0; i < keys.length; i++) {
            await manager.createHBFTestPod(
                this.prefix,
                i,
                keys[i],
                JSON.stringify(hbfTestData[keys[i]]),
                JSON.stringify(ports[keys[i]])
            )
        }

        await waitSetSize(streamFuncHandler.getStreamList(), keys.length, 3_600_000, 5)
        await this.reporter.setStauts(LaunchStatus.IN_PORCESS)

        await waitSetSize(streamFuncHandler.getStreamList(), 0, 3_600_000, 1_000)

        await this.reporter.closeLaunch(streamFuncHandler.failCount, streamFuncHandler.passCount, Date.now() - startTime)
        } catch(err) {
            await this.reporter.closeLaunchWithError(`${err}`)
        } finally {
            this.finish = true
            if(variables.get("IS_DESTROY_AFTER") === "true") {
                await manager.destroyAllByInstance(this.prefix)
            }
        } 
    }

    private async collectTestData(): Promise<{hbfTestData: IHBFTestData, ports: IPortForServer}> {
        const hbf = new HBFDataCollector()
        await hbf.collect()
        const hbfTestData = hbf.getTestData()
        const ports = hbf.gePortsForServer()
        return { hbfTestData, ports } 
    }

    isFinish(): boolean {
        return this.finish
    }
}