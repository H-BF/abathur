import { Status } from "../../../gRPC/control/Status";
import { AbaControlClient } from "../grpc/AbaControlClient";
import { IData } from "../interfaces";
import { Reporter } from "../reporter/reporter";
import { TestClient } from "../testClient";
import { IAdvancedScenario } from "./advanced.scenario.interface";

export class ChangeIpScenario implements IAdvancedScenario {

    private control: AbaControlClient
    private client: TestClient

    constructor(ip: string, funcType: string) {
        this.control = new AbaControlClient(ip, funcType)
        this.client = new TestClient(ip)
    }

    async start(data: IData[]) {
        try {
            this.control.sendMsg({ status: Status.ready })
            const luanchUUID = await this.control.listen()
            const reporter = new Reporter(luanchUUID)

            console.log("Ждем 60 секунд")
            await this.delay(60_000)
            await this.client.runTests(data)

            this.control.sendMsg({ status: Status.next })
            await this.control.listen()

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

    async delay(time: number) {
        return new Promise(resolve => setTimeout(resolve, time))
    }
}