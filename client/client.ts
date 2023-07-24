import { HbfTestClient } from './src/grpc/HBFTestClient';
import { ReportClient } from './src/grpc/ReporterClient';
import { delay, getMyIp } from './src/helper';
import { IData } from './src/interfaces';
import { TestClient } from './src/testClient';
// import { testData } from './testData';
import fs from 'fs';

(async () => {

    const myIp = getMyIp()
    const data: IData[] = JSON.parse(fs.readFileSync('./testData/testData.json', 'utf-8'))
    const test = new TestClient(myIp);
    const reporter = new ReportClient();

    console.log("start wait!")
    await delay(60000)
    console.log("end wait!\nGO!!!\n")
    
    console.log(data)
    
    test.evolveTestData(data)
    await test.runTests()
  

    console.log("Yeep!!!")
    console.log(test.getResults())
    reporter.sendReport(test.getResults())
})();