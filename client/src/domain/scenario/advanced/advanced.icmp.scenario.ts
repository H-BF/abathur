import { Status } from "../../../../gRPC/control/Status";
import { delay, isIcmpTestData } from "../../../helper";
import { AbaControlClient } from "../../grpc/AbaControlClient";
import { IcmpTestClient } from "../clients/icmpTestClient";
import { TestDataType } from "../../interfaces";
import { logger } from "../../logger/logger.service";
import { IAdvancedScenario } from "./interface/advanced.scenario.interface";
import { Reporter } from "../../reporter/reporter";

export class IcmpScenario implements IAdvancedScenario {
    
    private control: AbaControlClient
    private client: IcmpTestClient

    constructor(ip: string, funcType: string) {
        this.control = new AbaControlClient(ip, funcType)
        this. client = new IcmpTestClient(ip)
    }

    async start(data: TestDataType[]) {
        try {
            console.log("ICMP")
            console.log(data)

            if(!isIcmpTestData(data))
                throw new Error("Некорректный тип тестовых данных")

            this.control.sendMsg({ status: Status.ready })
            const launchUUID = await this.control.listen()

            await this.client.runTests(data)

            this.control.sendMsg({
                status: Status.finish,
                data: JSON.stringify({
                    fail: this.client.failCount,
                    pass: this.client.passCount
                })
            })

            console.log(this.client.getResults())

            const reporter = new Reporter(launchUUID)
            await reporter.send(this.client.getResults())

        } catch(err) {
            this.control.sendMsg({
                status: Status.error,
                data: `${err}`
            })
        } finally {
            this.control.endStream()
        }
    };
}