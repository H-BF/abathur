import { AbaControlClient } from './src/grpc/AbaControlClient';
import { ReportClient } from './src/grpc/ReporterClient';
import { getMyIp } from './src/helper';
import { IData } from './src/interfaces';
import { TestClient } from './src/testClient';
import fs from 'fs';

(async () => {
    const startTime = Date.now()
    const myIp = getMyIp()
    const data: IData[] = JSON.parse(fs.readFileSync('./testData/testData.json', 'utf-8'))
    
    const test = new TestClient(myIp);
    const reporter = new ReportClient();
    const control = new AbaControlClient(myIp)

    control.sendMsg({ status: "READY" })
    await control.listen()
    
    await test.runTests(data)
  

    let a = test.getResults()
    a.duration = Date.now() - startTime

    console.log(test.getResults())
    reporter.sendReport(a)

    control.endStream()
})();