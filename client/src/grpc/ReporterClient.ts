import path from 'path'
import * as protoLoader from '@grpc/proto-loader'
import * as grpc from '@grpc/grpc-js'
import { ProtoGrpcType } from '../../gRPC/reporter'
import { ReporterClient } from '../../gRPC/reporter/Reporter'
import { REPORTER_IP, REPORTER_PORT, REPORTER_PROTO_PATH } from '../../config'
import { IResults } from '../interfaces'

export class ReportClient {

    private reporter: ReporterClient

    constructor(options?: protoLoader.Options) {
        const packageDef = protoLoader.loadSync(
            path.resolve(__dirname, REPORTER_PROTO_PATH),
            options
        )
        
        const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

        this.reporter = new grpcObj.reporter.Reporter(
            `${REPORTER_IP}:${REPORTER_PORT}`,
            grpc.credentials.createInsecure()
        )
    }


    async sendReport(results: IResults) {
        console.log("Отправляем отчет")
        this.reporter.sendData(results, (err) => {
            if (err) {
                throw new Error(`${err}`)
            }
        })
    }
}