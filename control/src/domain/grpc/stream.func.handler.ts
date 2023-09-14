import { Req } from '../../../gRPC/control/Req'

class StreamFuncHandler {

    private streamsList: Set<string> = new Set;
    private testPodNumbers!: number;
    private launchUuid!: string;
    passCount: number = 0
    failCount: number = 0

    stream(call: any) {

        const streamID = call.metadata.get("id")[0]
        this.streamsList.add(streamID)

        console.log(`Начат стрим ${streamID}`)


        call.on("data", (request: Req) => {
            if(!request.status) 
                throw new Error('Обязательное поле status отсутствует')

            switch(request.status) {
                case 1:
                    console.log("Попали в ветку ready") 
                    const interval = setInterval(() => {
                        if (this.streamsList.size == this.testPodNumbers) {
                            clearInterval(interval)
                            call.write({ msg: this.launchUuid })
                        }
                    })
                    break;
                case 2:
                    console.log("Попали в ветку finish")
                    if(!request.data) 
                        throw new Error('Обязательное data status отсутствует')
                    const data = JSON.parse(request.data) as { fail: number, pass: number }
                    this.passCount += data.pass
                    this.failCount += data.fail
                    break;
            } 
        })

        call.on("end", () => {
            this.streamsList.delete(streamID)
            console.log(`Стрим c ${streamID} завершен!`)
        })
        
        call.on("error", (err: any) => {
            console.log(err)
        })
    }

    setHBFData(launchUuid: string, testPodNumbers: number) {
        this.launchUuid = launchUuid,
        this.testPodNumbers = testPodNumbers
    }

    getStreamList(): Set<string> {
        return this.streamsList
    }

}

export const streamFuncHandler = new StreamFuncHandler()