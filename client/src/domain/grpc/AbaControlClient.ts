import path from 'path'
import * as protoLoader from '@grpc/proto-loader'
import * as grpc from '@grpc/grpc-js'
import { ProtoGrpcType } from '../../../gRPC/control';
import { CONTROL_IP, CONTROL_PORT, CONTROL_PROTO_PATH } from '../../../config';
import { Res, Res__Output } from '../../../gRPC/control/Res';
import { Req } from '../../../gRPC/control/Req';
import { logger } from '../logger/logger.service';
import { ControlClient } from '../../../gRPC/control/Control';

export class AbaControlClient {

    private call: grpc.ClientDuplexStream<Req, Res__Output>
    private client: ControlClient
    private ip: string

    constructor(
        ip: string,
        funcType: string,
        options?: protoLoader.Options
    ) {
        this.ip = ip

        const packageDef = protoLoader.loadSync(
            path.resolve(__dirname, CONTROL_PROTO_PATH),
            options
        )
        
        const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

        this.client = new grpcObj.control.Control(
            `${CONTROL_IP}:${CONTROL_PORT}`,
            grpc.credentials.createInsecure()
        )

        const meta = new grpc.Metadata()
        meta.add('id', this.ip)
        meta.add('type', funcType)

        this.call = this.selectStream(funcType, meta)
    }

    sendMsg(msg: Req) {
        logger.info(`отправляем сообщение: ${JSON.stringify(msg)}`)
        this.call.write(msg)
    }

    endStream() {
        logger.info("закрываем стрим")
        this.call.end()
    }

    async listen(): Promise<string> {
        return new Promise((resolve) => {
            logger.info("Ждем команду от сервера")
            this.call.on('data', async (response: Res) => {
                if(!response.msg) {
                    throw new Error("Отсутствует поле msg")
                }
                logger.info(`Пришло сообщение от Abathur'a: ${ response.msg }`)
                resolve(response.msg)
            })
        })
    }

    private selectStream(
        funcType: string,
        meta: grpc.Metadata
    ): grpc.ClientDuplexStream<Req, Res__Output> {
        let call: grpc.ClientDuplexStream<Req, Res__Output>
        logger.info(`Сценарий: ${funcType}`)
        switch(funcType) {
            case 's2s':
            case 's2f':
                logger.debug("Запускаем стрим streamSimpleFunc")
                call = this.client.streamSimpleFunc(meta)
                break;
            case 'changeip':
                logger.debug("Запускаем стрим streamChangeIp")
                call = this.client.streamChangeIp(meta)
                break;
            default:
                throw new Error(`Неизвестный сценарий: ${funcType}`)
        }
        return call
    }
}