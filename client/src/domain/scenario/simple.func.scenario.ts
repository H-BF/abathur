import { AbaControlClient } from "../grpc/AbaControlClient";
import { Status } from "../../../gRPC/control/Status";
import { TestClient } from "../testClient";
import { Reporter } from "../reporter/reporter";
import { IData } from "../interfaces";

export class SimpleFuncScenario {

    private control: AbaControlClient
    private client: TestClient

    constructor(ip: string, funcType: string) {
        this.control = new AbaControlClient(ip, funcType)
        this.client  = new TestClient(ip)
    }

    async start(data: IData[]) {
        try {
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