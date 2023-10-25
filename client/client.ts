import { IConfigMapTestData, IData } from './src/domain/interfaces';
import { logger } from './src/domain/logger/logger.service';
import { advancedScenarioMaping } from './src/domain/scenario/advanced.scenario.maping';
import { SimpleFuncScenario } from './src/domain/scenario/simple.func.scenario';
import { getMyIp } from './src/helper';
import fs from 'fs';
import { variables } from './src/infrastructure/var_storage/variables-storage';

(async () => {
    const myIp = getMyIp()

    const testData: IConfigMapTestData = JSON.parse(
        fs.readFileSync(
            './testData/testData.json',
            'utf-8'
        )
    )

    const testName: string = testData.scenario
    const data: IData[] = testData.testData

    const type = testName.split("-")[0]
    const scenario = testName.split("-")[1]

    variables.set("TEST_NAME", testName)

    switch(type) {
        case 'simple':
            const simpleScenario = new SimpleFuncScenario(myIp, scenario)
            await simpleScenario.start(data)
            break;
        case 'advanced':
            const advancedScenario = new advancedScenarioMaping[scenario](myIp, scenario)
            advancedScenario.start(data)
            break;
        default:
            logger.error(`Неизвестный тип тестов: ${type}`)
    }
})();