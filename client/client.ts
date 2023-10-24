import { IConfigMapTestData, IData } from './src/domain/interfaces';
import { logger } from './src/domain/logger/logger.service';
import { advancedScenarioMaping } from './src/domain/scenario/advanced.scenario.maping';
import { SimpleFuncScenario } from './src/domain/scenario/simple.func.scenario';
import { getMyIp } from './src/helper';
import fs from 'fs';

(async () => {
    const myIp = getMyIp()

    const testData: IConfigMapTestData = JSON.parse(
        fs.readFileSync(
            './testData/testData.json',
            'utf-8'
        )
    )

    const scenario: string = testData.scenario
    const data: IData[] = testData.testData

    const type = scenario.split("-")[0]
    const funcType = scenario.split("-")[1]

    switch(type) {
        case 'simple':
            const simpleScenario = new SimpleFuncScenario(myIp, funcType)
            await simpleScenario.start(data)
            break;
        case 'advanced':
            const advancedScenario = new advancedScenarioMaping[funcType](myIp, funcType)
            advancedScenario.start(data)
            break;
        default:
            logger.error(`Неизвестный тип тестов: ${type}`)
    }
})();