import { Req } from "../../../gRPC/control/Req"

class StreamApiHandler {

    private launchUuid!: string;
    private streamsList: Set<string> = new Set;
    private result! : { fail: number, pass: number }
    
    stream(call: any) {

        const streamID = call.metadata.get("id")[0]
        this.streamsList.add(streamID)

        call.on("data", (request: Req) => {
            if(!request.status) 
                throw new Error('Обязательное поле status отсутствует')
            
            switch(request.status) {
                case 1:
                    console.log("Попали в ветку ready")
                    console.log("uuid: " + this.launchUuid)
                    call.write({ msg: this.launchUuid })
                    break
                case 2:
                    console.log("Попали в ветку finish")
                    if(!request.data) 
                        throw new Error('Обязательное data status отсутствует')
                    this.result = JSON.parse(request.data) as { fail: number, pass: number }
                    break
            }
        })

        call.on("end", () => {
            this.streamsList.delete(streamID)
            console.log(`Стрим c завершен!`)
        })

        call.on("error", (err: any) => {
            console.log(err)
        })
    }

    setLaunchUuid(launchUuid: string) {
        this.launchUuid = launchUuid
    }

    getStreamList(): Set<string> {
        return this.streamsList
    }

    getResult(): { fail: number, pass: number } {
        return this.result
    }
}

export const streamApiHandler = new StreamApiHandler()