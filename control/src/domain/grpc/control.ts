import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from '../../../gRPC/control'
import { streamFuncHandler } from './stream.func.handler'
import { streamApiHandler } from './stream.api.handler'
import { variables } from '../../infrastructure/var_storage/variables-storage'
import { logger } from '../logger/logger.service'

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
            streamFunc: streamFuncHandler.stream.bind(streamFuncHandler),
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