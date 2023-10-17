import { V1ConfigMap } from "@kubernetes/client-node"
import { hbfServer } from "../../specifications/hbfServer"
import { hbfTestStend } from "../../specifications/hbfTestStend"
import { variables } from "../../infrastructure/var_storage/variables-storage"
import { HBFReporter } from "../reporter/hbf.reporter"
import { manager } from "../k8s/PSCFabric"
import { podInf } from "../k8s/podInformer"
import { PodStatus } from "../k8s/enums"
import { HBFDataCollector } from "../hbf"
import { IHBFTestData, IPortForServer } from "../hbf/interfaces"
import { getSvcNameTail, waitSetSize } from "../helpers"
import { LaunchStatus } from "../../infrastructure/reporter"
import { streamFuncHandler } from "../grpc/stream.func.handler"
import fs from 'fs'
import path from 'path'
import { ScenarioInterface } from "./scenario.interface"
import { logger } from "../logger/logger.service"

export class HBFFuncScenario implements ScenarioInterface {

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
           .replaceAll("${PREFIX}", this.prefix)
           .replaceAll("${PIPLINE_ID}", variables.get("PIPELINE_ID"))
           .replaceAll("${TAIL}", getSvcNameTail())
        }) as V1ConfigMap)
        this.sharedConfigMaps.push(hbfServer.hbfConfMap({
            prefix: this.prefix,
            port: this.hbfServerPort
        }) as V1ConfigMap)
        this.sharedConfigMaps.push(hbfTestStend.specConfMapHbfClient({
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
            logger.info("[FUNC] HBF functional tests")
            const startTime = Date.now()
            await this.reporter.createLaunch(
                variables.get("PIPELINE_ID"),
                variables.get("JOB_ID"),
                variables.get("CI_SOURCE_BRANCH_NAME"),
                variables.get("CI_TARGET_BRANCH_NAME"),
                variables.get("COMMIT"),
                variables.get("HBF_TAG"),
                this.prefix
            )

            await manager.createSharedConfigMaps(this.sharedConfigMaps, this.prefix)
            await manager.createHBFServer(this.prefix, this.hbfServerIP, this.hbfServerPort)

            await podInf.waitStatus(
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                 PodStatus.RUNNING,
                 this.prefix
            )
            
            await podInf.waitContainerIsReady(
                `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
                this.prefix
            )

           const { hbfTestData, fqdn, ports } = await this.collectTestData()

           const keys = Object.keys(hbfTestData)
           streamFuncHandler.setHBFData(this.reporter.launchUUID, keys.length)

           for (let i = 0; i < keys.length; i++) {
            await manager.createHBFTestStend(
                this.prefix,
                i,
                keys[i],
                JSON.stringify(hbfTestData[keys[i]]),
                JSON.stringify(ports[keys[i]])
            )
        }

        for (let i = 0; i < fqdn.length; i++) {
            await manager.createFQDNTestStend(
                this.prefix,
                fqdn[i].split(".")[0],
                JSON.stringify(ports[fqdn[i]]),
                this.evalutePorts(ports[fqdn[i]]).map((item, index) => ({
                    name: `${fqdn[i].split(".")[0]}-${index}`,
                    port: Number(item),
                    targetPort: Number(item)
                }))
            )
        }

        await waitSetSize(streamFuncHandler.getStreamList(), keys.length, 3_600_000, 5)
        await this.reporter.setStauts(LaunchStatus.IN_PORCESS)

        await waitSetSize(streamFuncHandler.getStreamList(), 0, 3_600_000, 1_000)

        await this.reporter.closeLaunch(streamFuncHandler.failCount, streamFuncHandler.passCount, Date.now() - startTime)
        } catch(err) {
            logger.error(err)
            await this.reporter.closeLaunchWithError(`${err}`)
        } finally {
            this.finish = true
            if(variables.get("IS_DESTROY_AFTER") === "true") {
                await manager.destroyAllByInstance(this.prefix)
            }
        } 
    }

    private async collectTestData(): Promise<{hbfTestData: IHBFTestData, fqdn: string[], ports: IPortForServer}> {
        const hbf = new HBFDataCollector()
        await hbf.collect()

        const hbfTestData = hbf.getTestData()
        const fqdn = hbf.getFqdnList()
        const ports = hbf.gePortsForServer()

        return { hbfTestData, fqdn, ports } 
    }

    private evalutePorts(ports: string[]): string[] {
        return ports.flatMap((port) => {
            if (port.includes("-")) {
            const [start, end] = port.split("-");
            return Array.from({ length: Number(end) - Number(start) + 1 }, (_, i) =>
                (Number(start) + i).toString()
            );
            } else {
                return [port];
            }
        });
    }

    isFinish(): boolean {
        return this.finish
    }
}