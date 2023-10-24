import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from '../../../gRPC/control'
import { streamSimpleFuncHandler } from './stream.simple.func.handler'
import { streamApiHandler } from './stream.api.handler'
import { variables } from '../../infrastructure/var_storage/variables-storage'
import { logger } from '../logger/logger.service'
import { streamChangeIpHandler } from './stream.change-ip.handler'

class ControlServer {

    private controlServer: grpc.Server;

    constructor() {
        logger.info("[MAIN] Создаем gRPC control server")
        this.controlServer = new grpc.Server()

        const packageDef = protoLoader.loadSync(path.resolve(__dirname, "../../../../gRPC/control.proto"), {
            keepCase: true
        })
        const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

        this.controlServer.addService(grpcObj.control.Control.service, {
            streamSimpleFunc: streamSimpleFuncHandler.stream.bind(streamSimpleFuncHandler),
            streamChangeIp: streamChangeIpHandler.stream.bind(streamChangeIpHandler),
            streamApi: streamApiHandler.stream.bind(streamApiHandler)
        })
    }

    start() {
        this.controlServer.bindAsync(
            `0.0.0.0:${variables.get("ABA_CONTROL_PORT")}`,
            grpc.ServerCredentials.createInsecure(),
            err => {
                if (err) {
                    logger.error(err)
                    return
                }
                this.controlServer.start()
                logger.info(`[MAIN] Control Server start successfully!`)
            }
        )
    }
}

export const controlServer = new ControlServer()