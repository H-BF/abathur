import { sleep } from "../helpers"
import { logger } from "../logger/logger.service"

export function retry(
    maxAttempts: number = 3,
    delay: number = 5_000
) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalFunc = descriptor.value
        descriptor.value = async function(...args: any[]) {
            let attempts = 1
            while (attempts <= maxAttempts) {
                try {
                    return await originalFunc.apply(this, args) 
                } catch (err) {
                    logger.info(`Попытка ${attempts} неуспешна: ${err}`)
                    attempts++
                    await sleep(delay)
                }
            }
            throw new Error("Использованно максимальное число повторов")
        }
        return descriptor
    }
}