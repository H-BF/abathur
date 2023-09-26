import fs from "fs";
import path from 'path';
import { V1ConfigMap } from "@kubernetes/client-node"
import { variables } from "../../infrastructure/var_storage/variables-storage"
import { APIReporter } from "../reporter/api.reporter"
import { PodStatus } from "../k8s/enums"
import { manager } from "../k8s/PSCFabric"
import { podInf } from "../k8s/podInformer"
import { delay, waitSetSize } from "../helpers"
import { hbfServer } from "../../specifications/hbfServer"
import { apiTestPod } from "../../specifications/apiTestPod"
import { streamApiHandler } from "../grpc/stream.api.handler"
import { LaunchStatus } from "../../infrastructure/reporter";
import { ScenarioInterface } from "./scenario.interface";

export class HBFApiScenario implements ScenarioInterface {

    private prefix = 'api'
    private sharedConfigMaps: V1ConfigMap[] = []
    private hbfServerIP = variables.get("A_HBF_SERVER_IP")
    private hbfServerPort = variables.get("A_HBF_SERVER_PORT")
    private apiTestIp = variables.get("API_TEST_IP")

    private reporter: APIReporter
    private finish: boolean = false

    constructor() {
        let data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../test_data/swarm.json"), "utf-8"))
        data.variable.forEach((vr: any) => {
            if (vr.key === "HOST") {
                vr.value = this.hbfServerIP
            } else if (vr.key === "PORT") {
                vr.value = this.hbfServerPort
            }
        })

        this.sharedConfigMaps.push(hbfServer.pgConfMap({
            prefix: this.prefix,
            data: fs.readFileSync(path.resolve(__dirname, "../../../sql/hbf.api.sql"), "utf-8") 
        }) as V1ConfigMap)
        this.sharedConfigMaps.push(hbfServer.hbfConfMap({
            prefix: this.prefix,
            port: this.hbfServerPort
        }) as V1ConfigMap)
        this.sharedConfigMaps.push(apiTestPod.specConfMapNewmanTestData({
            prefix: this.prefix,
            data: JSON.stringify(data)
        }) as V1ConfigMap)
        this.sharedConfigMaps.push(hbfServer.specConfMapWaitDb({
            prefix: this.prefix            
        }) as V1ConfigMap)

        this.reporter = new APIReporter()
    }

    async start() {
        try {
            console.log("API tests")
            const startTime = Date.now()
            await this.reporter.createLaunch(
                variables.get("PIPELINE_ID"),
                variables.get("JOB_ID"),
                variables.get("CI_SOURCE_BRANCH_NAME"),
                variables.get("CI_TARGET_BRANCH_NAME"),
                variables.get("COMMIT"),
                variables.get("HBF_TAG")
            )
            
            console.log(`[SCENARIO] uuid: ${this.reporter.launchUUID}`)
            streamApiHandler.setLaunchUuid(this.reporter.launchUUID)
    
            await manager.createSharedConfigMaps(this.sharedConfigMaps)
            await manager.createHBFServer(this.prefix, this.hbfServerIP, this.hbfServerPort)
    
            await podInf.waitStatus(
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                 PodStatus.RUNNING
            )
            await podInf.waitContainerIsReady(
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`
            )

            await manager.createAPITestPod(
                this.prefix, 
                this.apiTestIp
            )
    
            await waitSetSize(streamApiHandler.getStreamList(), 1, 180_000, 5)
            await this.reporter.setStauts(LaunchStatus.IN_PORCESS)
            await waitSetSize(streamApiHandler.getStreamList(), 0, 180_000, 10_000)
    
            const { fail, pass } = streamApiHandler.getResult()
    
            await this.reporter.closeLaunch(fail, pass, Date.now() - startTime)
        } catch(err) {
            await this.reporter.closeLaunchWithError(`${err}`)
        } finally {
            this.finish = true
            if(variables.get("IS_DESTROY_AFTER") === "true") {
                await manager.destroyAllByInstance(this.prefix)
            }
        }
    }

    isFinish(): boolean {
        return this.finish
    }
}