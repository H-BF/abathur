import { Axios } from "axios";

export class RestClient extends Axios {

    constructor(
        baseUrl: string,
        port: string,
        protocol: string
    ) {

        super({
            baseURL: `${protocol}://${baseUrl}:${port}`,
            headers: {
                "Content-type": "application/json"    
            },
            transformResponse: [function (data) {
                try {
                    if (data)
                        return JSON.parse(data)
                } catch (e) {
                    console.warn("Payload type is unexpected", e)
                }

                return data
            }],
            transformRequest: [
                function (data) {
                    if (data && "object" == typeof data)
                        return JSON.stringify(data)
                    return data
                }
            ],
            validateStatus: (status) => {
                if(!(status >= 200 && status < 300)) {
                    return false
                }
                return true
            }
        })
    }
}