import { Status } from "../../../../gRPC/control/Status";
import { delay, isTcpTestData } from "../../../helper";
import { AbaControlClient } from "../../grpc/AbaControlClient";
import { TestDataType } from "../../interfaces";
import { logger } from "../../logger/logger.service";
import { Reporter } from "../../reporter/reporter";
import { TcpTestClient } from "../clients/tcpTestClient";
import { IAdvancedScenario } from "./interface/advanced.scenario.interface";

export class ChangeIpScenario implements IAdvancedScenario {

    private control: AbaControlClient
    private client: TcpTestClient

    constructor(ip: string, funcType: string) {
        this.control = new AbaControlClient(ip, funcType)
        this.client = new TcpTestClient(ip)
    }

    async start(data: TestDataType[]) {
        try {

            if(!isTcpTestData(data))
                throw new Error("Некорректный тип тестовых данных")

            this.control.sendMsg({ status: Status.ready })
            const luanchUUID = await this.control.listen()
            const reporter = new Reporter(luanchUUID)

            logger.info("Ждем 60 секунд")
            await delay(60_000)
            await this.client.runTests(data)

            this.control.sendMsg({ status: Status.next })
            await this.control.listen()

            await delay(10_000)
            await this.client.runTests(data)
            await reporter.send(this.client.getResults())

            this.control.sendMsg({
                status: Status.finish,
                data: JSON.stringify({
                    fail: this.client.failCount,
                    pass: this.client.passCount
                })
            })
        } catch(err) {
            this.control.sendMsg({
                status: Status.error,
                data: `${err}`
            })
        } finally {
            this.control.endStream() 
        }
    }
}