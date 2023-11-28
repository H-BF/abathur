import fs from 'fs';
import path from 'path';
import { getSvcNameTail } from "../../helpers";
import { podInf } from '../../k8s/podInformer';
import { PodStatus } from '../../k8s/enums';
import { manager } from '../../k8s/PSCFabric';
import { V1ConfigMap } from "@kubernetes/client-node";
import { hbfServer } from "../../../specifications/hbfServer";
import { hbfTestStend } from "../../../specifications/hbfTestStend";
import { IScenarioInterface } from "../interface/scenario.interface";
import { variables } from "../../../infrastructure/var_storage/variables-storage";
import { IPortsToServer } from '../../hbf/interfaces';
import { instanceList } from '../../instance.list';

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

        instanceList.push(this.prefix)

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

    protected evalutePorts(ports: IPortsToServer): {port: string, protocol: string}[] {
        const tcpPorts = this.evalutePortsForProto(ports.TCP).map(item => ({
            port: item,
            protocol: 'TCP'
        }))
        const udpPorts = this.evalutePortsForProto(ports.UDP).map(item => ({
            port: item,
            protocol: 'UDP'
        }))
       return tcpPorts.concat(udpPorts).flat()
    }
    
    private evalutePortsForProto(ports: string[]): string[] {
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