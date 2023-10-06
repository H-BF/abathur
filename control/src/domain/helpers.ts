import { logger } from "./logger/logger.service";
import { ScenarioInterface } from "./scenarios/scenario.interface"
import * as dns from 'dns';

export async function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
}

export async function waitSetSize(
    data: Set<any>,
    size: number,
    timeout: number = 60000,
    frequency: number = 1000
): Promise<void> {
    logger.info(`Ждем пока размер массива станет ${size}`)
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            if (data.size === size) {
                clearInterval(interval)
                resolve()
            } else if(Date.now() - startTime >= timeout) {
                clearInterval(interval)
                reject(new Error("Timeout occurred!!"))
            }
        }, frequency)
    })
}

export async function allRecordsValueIs<T extends string | number>(
    data: Record<any, T>,
    value: T,
    timeout: number = 60000,
    frequency: number = 1000
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            logger.info("Ждем одинаковые статусы")
            const values = new Set<T>(Object.values(data))
            if(values.size === 1 && values.has(value)) {
                clearInterval(interval)
                resolve()
            } else if(Date.now() - startTime >= timeout) {
                clearInterval(interval)
                reject(new Error("Timeout occurred!!"))
            }
        }, frequency)
    })
}

export async function waitScenarioIsFinish(
    scenarios: ScenarioInterface[],
    timeout: number = 300000,
    frequency: number = 1000
): Promise<void> {
    logger.info(`Ждем сценарии завершатся`)
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            if(scenarios.length === 0) {
                clearInterval(interval)
                resolve()
            } else if(Date.now() - startTime >= timeout) {
                clearInterval(interval)
                reject(new Error(`Сценарии ${scenarios.join(", ")} не завершились за отведенные ${timeout} мс`))
            } else {
                scenarios = scenarios.filter((scenario) => !scenario.isFinish());
            }
        }, frequency)
    })
}

export async function resolveHostName(hostName: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        dns.resolve(hostName, (err, addresses) => {
            if (err) reject(err)
            resolve(addresses)
        })
    })
}