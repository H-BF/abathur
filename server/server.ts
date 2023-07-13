import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from './gRPC/HBFTest';

const PROTO_FILE_PATH = "../gRPC/HBFTest.proto"
const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE_PATH), {
    keepCase: true
})

const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType        

const serverTCP = new grpc.Server();

serverTCP.addService(grpcObj.HBFTest.HBFTest.service, {
    ping: (res: any, req: Function) => {
        req(null, { msg: "OK" })
    }
});

(async () => {
        serverTCP.bindAsync(
            `0.0.0.0:9091`,
            grpc.ServerCredentials.createInsecure(),
            err => {
                if (err) {
                    console.log(err)
                    return
                }
                serverTCP.start()
                console.log(`Server start successfully!`)
            }
        );
})();
