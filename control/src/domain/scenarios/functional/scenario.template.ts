import fs from 'fs';
import path from 'path';
import { HBFDataCollector } from '../../hbf';
import { getSvcNameTail } from "../../helpers";
import { podInf } from '../../k8s/podInformer';
import { PodStatus } from '../../k8s/enums';
import { manager } from '../../k8s/PSCFabric';
import { V1ConfigMap } from "@kubernetes/client-node";
import { hbfServer } from "../../../specifications/hbfServer";
import { hbfTestStend } from "../../../specifications/hbfTestStend";
import { IScenarioInterface } from "../interface/scenario.interface";
import { IHBFTestData, IPortForServer } from '../../hbf/interfaces';
import { variables } from "../../../infrastructure/var_storage/variables-storage";

export abstract class ScenarioTemplate implements IScenarioInterface {

    protected prefix: string
    protected hbfServerIP: string
    protected hbfServerPort: string
    protected sharedConfigMaps: V1ConfigMap[] = []
    protected finish: boolean = false

    failCount: number = 0
    passCount: number = 0

    constructor(
        prefix: string,
        ip: string,
        port: string,
        sqlFilePath: string,
        exitOnSuccess: boolean = true
    ) {
        this.prefix = prefix
        this.hbfServerIP = ip
        this.hbfServerPort = port

        this.sharedConfigMaps.push(hbfServer.pgConfMap({
            prefix: this.prefix,
            data: fs.readFileSync(path.resolve(__dirname, sqlFilePath), "utf-8")
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
             port: this.hbfServerPort,
             exitOnSuccess: exitOnSuccess         
         }) as V1ConfigMap)
         this.sharedConfigMaps.push(hbfServer.specConfMapWaitDb({
             prefix: this.prefix            
         }) as V1ConfigMap)
    }

    async start() {
        await manager.createSharedConfigMaps(
            this.sharedConfigMaps,
            this.prefix
        )
        await manager.createHBFServer(
            this.prefix,
            this.hbfServerIP,
            this.hbfServerPort
        )

        await podInf.waitStatus(
            `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
             PodStatus.RUNNING,
             this.prefix
        )
        
        await podInf.waitContainerIsReady(
            `${this.prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
            this.prefix
        )
    }

    isFinish(): boolean {
        return this.finish
    }

    setLaunchUuid() {};

    protected async collectTestData(prefix: string): Promise<{hbfTestData: IHBFTestData, fqdn: string[], ports: IPortForServer}> {
        const hbf = new HBFDataCollector(
            "http",
            `${prefix}-p${variables.get("PIPELINE_ID")}-hbf-server`,
            "80"
        )
        await hbf.collect()

        const hbfTestData = hbf.getTestData()
        const fqdn = hbf.getFqdnList()
        const ports = hbf.gePortsForServer()

        return { hbfTestData, fqdn, ports } 
    }

    protected evalutePorts(ports: string[]): string[] {
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
}