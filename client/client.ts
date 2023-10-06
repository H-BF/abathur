import { AbaControlClient } from './src/domain/grpc/AbaControlClient';
import { getMyIp } from './src/helper';
import { IData } from './src/domain/interfaces';
import { TestClient } from './src/domain/testClient';
import { Reporter } from './src/domain/reporter/reporter';
import { Status } from './gRPC/control/Status';
import fs from 'fs';

(async () => {
    const myIp = getMyIp()
    const control = new AbaControlClient(myIp)

    try {
        const data: IData[] = JSON.parse(fs.readFileSync('./testData/testData.json', 'utf-8'))
        const test = new TestClient(myIp);
    
        control.sendMsg({ status: Status.ready })
        const luanchUUID = await control.listen()
    
        await test.runTests(data)
        control.sendMsg({
            status: Status.finish, 
            data: JSON.stringify({ fail: test.failCount, pass: test.passCount })
        })
          
        const reporter = new Reporter(luanchUUID)
        await reporter.send(test.getResults())
    
    } catch(err) {
        control.sendMsg({
            status: Status.error,
            data: `${err}`
        })
    } finally {
        control.endStream()
    }
})();