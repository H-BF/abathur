import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from '../../../gRPC/control'
import { Req } from '../../../gRPC/control/Req'
import { allRecordsValueIs, waitRecordSize } from '../helpers'

export class ControlServer {

    private controlServer: grpc.Server;
    private testPodNumbers: number;
    private launchUuid: string;
    private streamsRecord: Record<string, string> = {};

    constructor(launchUuid: string, testPodNumbers: number) {
        this.launchUuid = launchUuid
        this.testPodNumbers =testPodNumbers
        this.controlServer = new grpc.Server()

        const packageDef = protoLoader.loadSync(path.resolve(__dirname, "../../../../gRPC/control.proto"), {
            keepCase: true
        })
        const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

        this.controlServer.addService(grpcObj.control.Control.service, {
            stream: this.stream
        })
    }

    private stream(call: any) {

        this.streamsRecord = {};
        console.log()

        call.on("data", async (request: Req) => {
            if(!request.ip) 
                throw new Error('Обязательное поле ip отсутствует')
            
            if(!request.status) 
                throw new Error('Обязательное поле status отсутствует')

            console.log(this.streamsRecord)
            console.log(`Пришло сообщение: ${request.ip} : ${request.status}`)
            this.streamsRecord[request.ip] = request.status
        })

        call.on("end", () => {
            console.log("Стрим завершен!")
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

    getStreamList(): Record<string, string> {
        return this.streamsRecord
    }
}