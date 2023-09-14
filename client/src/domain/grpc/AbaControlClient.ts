import path from 'path'
import * as protoLoader from '@grpc/proto-loader'
import * as grpc from '@grpc/grpc-js'
import { ProtoGrpcType } from '../../../gRPC/control';
import { CONTROL_IP, CONTROL_PORT, CONTROL_PROTO_PATH } from '../../../config';
import { Res } from '../../../gRPC/control/Res';
import { Req } from '../../../gRPC/control/Req';

export class AbaControlClient {

    private call: any
    private ip: string

    constructor( ip: string, options?: protoLoader.Options) {

        this.ip = ip

        const packageDef = protoLoader.loadSync(
            path.resolve(__dirname, CONTROL_PROTO_PATH),
            options
        )
        
        const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

        const client = new grpcObj.control.Control(
            `${CONTROL_IP}:${CONTROL_PORT}`,
            grpc.credentials.createInsecure()
        )

        const meta = new grpc.Metadata()
        meta.add('id', this.ip)

        this.call = client.streamFunc(meta)
    }

    sendMsg(msg: Req) {
        console.log("отправляем сообщение")
        this.call.write(msg)
    }

    endStream() {
        console.log("закрываем стрим")
        this.call.end()
    }

    async listen(): Promise<string> {
        return new Promise((resolve) => {
            console.log("Ждем команду от сервера")
            this.call.on('data', async (response: Res) => {
                if(!response.msg) {
                    throw new Error("Отсутствует поле msg")
                }
                console.log("Пришла!")
                resolve(response.msg)
            })
        })
    }
}