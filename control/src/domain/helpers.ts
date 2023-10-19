import { logger } from "./logger/logger.service";
import { IScenarioInterface } from "./scenarios/interface/scenario.interface"
import * as dns from 'dns';
import fs from 'fs';

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
    scenarios: IScenarioInterface[],
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

export function getSvcNameTail(): string {
    const searchLine = fs.readFileSync("/etc/resolv.conf", "utf-8")
        .split("\n")
        .find(line => line.startsWith("search"))

    if(!searchLine)
        throw new Error("строка не найдена")

    return searchLine.split(" ")[1]
}

export function isCIDR(str: string): boolean {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (!cidrRegex.test(str)) {
      return false;
    }
  
    const [ip, mask] = str.split('/');
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) {
      return false;
    }
  
    for (const part of ipParts) {
      const num = parseInt(part, 10);
      if (isNaN(num) || num < 0 || num > 255) {
        return false;
      }
    }
  
    const maskNum = parseInt(mask, 10);
    if (isNaN(maskNum) || maskNum < 0 || maskNum > 32) {
      return false;
    }
  
    return true;
}