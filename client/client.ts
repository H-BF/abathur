import { AbaControlClient } from './src/domain/grpc/AbaControlClient';
import { getMyIp } from './src/helper';
import { IData } from './src/domain/interfaces';
import { TestClient } from './src/domain/testClient';
import { Reporter } from './src/domain/reporter/reporter';
import { Status } from './gRPC/control/Status';
import fs from 'fs';

(async () => {
    const myIp = getMyIp()
    const data: IData[] = JSON.parse(fs.readFileSync('./testData/testData.json', 'utf-8'))

    const test = new TestClient(myIp);
    const control = new AbaControlClient(myIp)

    control.sendMsg({ status: Status.ready })
    const luanchUUID = await control.listen()

    console.log(luanchUUID)

    await test.runTests(data)
    control.sendMsg({
        status: Status.finish, 
        data: JSON.stringify({ fail: test.failCount, pass: test.passCount })
    })
      
    console.log(test.getResults())

    const reporter = new Reporter(luanchUUID)
    await reporter.send(test.getResults())

    control.endStream()
})();