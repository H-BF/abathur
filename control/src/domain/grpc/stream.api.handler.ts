import { Req } from "../../../gRPC/control/Req"

class StreamApiHandler {

    private launchUuid!: string;

    stream(call: any) {
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
                    const data = JSON.parse(request.data) as { fail: number, pass: number }
                    console.log(data)
                    break
            }
        })

        call.on("end", () => {
            console.log(`Стрим c завершен!`)
        })

        call.on("error", (err: any) => {
            console.log(err)
        })
    }

    setLaunchUuid(launchUuid: string) {
        this.launchUuid = launchUuid
    }
}

export const streamApiHandler = new StreamApiHandler()