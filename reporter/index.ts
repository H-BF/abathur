import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from './gRPC/reporter'
import { IResults } from './src/interfaces'

const PROTO_FILE_PATH = "../gRPC/reporter.proto"
const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE_PATH), {
    keepCase: true
})

const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

const reportServer = new grpc.Server();

let report: IResults[] = []

reportServer.addService(grpcObj.reporter.Reporter.service, {
    sendData: (res: any, req: Function) => {
        report.push(res.request as IResults)
        req(null, {})
    }
});

(async () => {
    reportServer.bindAsync(
        '0.0.0.0:9091',
        grpc.ServerCredentials.createInsecure(),
        err => {
            if (err) {
                console.log(err)
                return
            }
            reportServer.start()
            console.log(`Server start successfully!`)
        }
    )

    await waitForArraySize(report)

    console.log("Bce отчеты получены!\n")
    console.log(report)

})();

function waitForArraySize(foo: any[]) {
    return new Promise<void>(resolve => {
        const interval = setInterval(() => {
            console.log(`report size: ${report.length}`)
            if(foo.length === 10){
                clearInterval(interval);
                resolve()
            }
        }, 60000)
    })
}