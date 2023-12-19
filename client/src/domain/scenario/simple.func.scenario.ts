import { AbaControlClient } from "../grpc/AbaControlClient";
import { Status } from "../../../gRPC/control/Status";
import { TestClient } from "./clients/tcp.udp.test-client";
import { Reporter } from "../reporter/reporter";
import { TestDataType } from "../interfaces";
import { isTcpTestData } from "../../helper";

export class SimpleFuncScenario {

    private control: AbaControlClient
    private testClient: TestClient

    constructor(ip: string, funcType: string) {
        this.control = new AbaControlClient(ip, funcType)
        this.testClient  = new TestClient(ip)
    }

    async start(data: TestDataType[]) {
        try {

            if(!isTcpTestData(data))
                throw new Error("Некорректный тип тестовых данных")

            this.control.sendMsg({ status: Status.ready })
            const luanchUUID = await this.control.listen()
    
            await this.testClient.runTests(data)
    
            this.control.sendMsg({
                status: Status.finish, 
                data: JSON.stringify({ 
                    fail: this.testClient.failCount,
                    pass: this.testClient.passCount 
                })
            })
    
            const reporter = new Reporter(luanchUUID)
            await reporter.send(this.testClient.getResults())
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