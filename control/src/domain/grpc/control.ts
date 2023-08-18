import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from '../../../gRPC/control'
import { Req } from '../../../gRPC/control/Req'

export class ControlServer {

    private controlServer: grpc.Server;
    private testPodNumbers: number;
    private launchUuid: string;
    private streamsList: Set<string> = new Set;
    passCount: number = 0
    failCount: number = 0


    constructor(launchUuid: string, testPodNumbers: number) {
        this.launchUuid = launchUuid
        this.testPodNumbers =testPodNumbers
        this.controlServer = new grpc.Server()

        const packageDef = protoLoader.loadSync(path.resolve(__dirname, "../../../../gRPC/control.proto"), {
            keepCase: true
        })
        const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

        this.controlServer.addService(grpcObj.control.Control.service, {
            stream: this.stream.bind(this)
        })
    }

    private stream(call: any) {
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
                    console.log("Попали в ветку break")
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

    start() {
        this.controlServer.bindAsync(
            '0.0.0.0:9091',
            grpc.ServerCredentials.createInsecure(),
            err => {
                if (err) {
                    console.log(err)
                    return
                }
                this.controlServer.start()
                console.log(`Control Server start successfully!`)
            }
        )
    }

    getStreamList(): Set<string> {
        return this.streamsList
    }
}