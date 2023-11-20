import { AbaControlClient } from "../grpc/AbaControlClient";
import { Status } from "../../../gRPC/control/Status";
import { TcpTestClient } from "./clients/tcpTestClient";
import { Reporter } from "../reporter/reporter";
import { TestDataType } from "../interfaces";
import { isTcpTestData } from "../../helper";

export class SimpleFuncScenario {

    private control: AbaControlClient
    private client: TcpTestClient

    constructor(ip: string, funcType: string) {
        this.control = new AbaControlClient(ip, funcType)
        this.client  = new TcpTestClient(ip)
    }

    async start(data: TestDataType[]) {
        try {

            if(!isTcpTestData(data))
                throw new Error("Некорректный тип тестовых данных")

            this.control.sendMsg({ status: Status.ready })
            const luanchUUID = await this.control.listen()
    
            await this.client.runTests(data)
    
            this.control.sendMsg({
                status: Status.finish, 
                data: JSON.stringify({ 
                    fail: this.client.failCount,
                    pass: this.client.passCount 
                })
            })
    
            const reporter = new Reporter(luanchUUID)
            await reporter.send(this.client.getResults())
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