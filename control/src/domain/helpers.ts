
export async function waitSetSize(
    data: Set<any>,
    size: number,
    timeout: number = 60000,
    frequency: number = 1000
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            console.log(`Ждем пока размер массива станет ${size}. Текущий: ${data.size}`)
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
            console.log("Ждем одинаковые статусы")
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