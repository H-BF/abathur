import { AbaControlClient } from './src/grpc/AbaControlClient';
import { ReportClient } from './src/grpc/ReporterClient';
import { getMyIp } from './src/helper';
import { IData } from './src/interfaces';
import { TestClient } from './src/testClient';
import fs from 'fs';

(async () => {

    const myIp = getMyIp()
    const data: IData[] = JSON.parse(fs.readFileSync('./testData/testData.json', 'utf-8'))
    
    const test = new TestClient(myIp);
    const reporter = new ReportClient();
    const control = new AbaControlClient()

    control.sendMsg({ip: myIp, status: "Ready"})
    await control.listen()
    
    test.evolveTestData(data)
    await test.runTests()
  
    console.log("Yeep!!!")
    console.log(test.getResults())
    reporter.sendReport(test.getResults())

    control.sendMsg({ip: myIp, status: "Finish"})
    control.endStream()
})();