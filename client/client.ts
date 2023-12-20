import { IConfigMapTestData, ITcpUdpTestData, TestDataType } from './src/domain/interfaces';
import { logger } from './src/domain/logger/logger.service';
import { advancedScenarioMaping } from './src/domain/scenario/advanced/advanced.scenario.maping';
import { SimpleFuncScenario } from './src/domain/scenario/simple.func.scenario';
import { getMyIp } from './src/helper';
import fs from 'fs';
import { variables } from './src/infrastructure/var_storage/variables-storage';

(async () => {
    const myIp = getMyIp()
    const path = './testData/testData.json'

    if(!fs.existsSync(path)) {
        logger.info("Нет файла тестовых данных для этой машины")
        process.exit(0)
    }

    const testData: IConfigMapTestData = JSON.parse(
        fs.readFileSync(
            './testData/testData.json',
            'utf-8'
        )
    )

    const testName: string = testData.scenario
    const data: TestDataType[] = testData.testData

    if(data === undefined) {
        logger.info("Нет тестовых данных для этой машины")
        process.exit(0)
    }

    const [type, scenario, subscenario] = testName.split("-")

    variables.set("TEST_NAME", testName)

    switch(type) {
        case 'simple':
            const simpleScenario = new SimpleFuncScenario(myIp, scenario)
            await simpleScenario.start(data)
            break;
        case 'advanced':
            const advancedScenario = new advancedScenarioMaping[scenario](myIp, scenario)
            await advancedScenario.start(data)
            break;
        default:
            logger.error(`Неизвестный тип тестов: ${type}`)
    }
})();