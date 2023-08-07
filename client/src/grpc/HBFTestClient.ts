import * as protoLoader from '@grpc/proto-loader'
import * as grpc from '@grpc/grpc-js'
import path from 'path'
import { ProtoGrpcType } from '../../gRPC/HBFTest'
import { HBFTestClient } from '../../gRPC/HBFTest/HBFTest'
import { pingResponse__Output } from '../../gRPC/HBFTest/pingResponse'
import { HBF_TEST_PROTO_PATH } from '../../config'
import { Metadata } from '@grpc/grpc-js'
import { IResult } from '../interfaces'

export class HbfTestClient {

    private client: HBFTestClient

    constructor(dstIp: string, dstPort: string, options?: protoLoader.Options) {
        const packageDef = protoLoader.loadSync(
            path.resolve(__dirname, HBF_TEST_PROTO_PATH),
            options
        )

        const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType
        this.client = new grpcObj.HBFTest.HBFTest(
            `${dstIp}:${dstPort}`,
            grpc.credentials.createInsecure()
        )
    }

    async ping(metadata: Metadata): Promise<pingResponse__Output | undefined> {
        return await new Promise<pingResponse__Output | undefined>((resolve, reject) => {
            this.client.ping({}, metadata, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    }

    collectMetadata(
        sgFrom: string,
        sgTo: string,
        srcIp: string,
        srcPort: string,
        dstIp: string,
        dstPort: string
    ): grpc.Metadata {
        let metadata = new grpc.Metadata()
        metadata.add("sg-from", sgFrom)
        metadata.add("sg-to", sgTo)
        metadata.add("src-ip", srcIp)
        metadata.add("src-port", `${srcPort}`)
        metadata.add("dst-ip", `${dstIp}`)
        metadata.add("dst-port", `${dstPort}`)
        metadata.add("protocol", "tcp")
        return metadata
    }

    getFromMetadata(data: grpc.Metadata): IResult {
        return {
            sgFrom: data.get("sg-from")[0].toString(),
            sgTo: data.get("sg-to")[0].toString(),
            srcIp: data.get("src-ip")[0].toString() || "any",
            srcPort: data.get("src-port")[0].toString(),
            dstIp: data.get("dst-ip")[0].toString(),
            dstPort: data.get("dst-port")[0].toString(),
            protocol: data.get("protocol")[0].toString(),
            msg: ''
        }
    }
}
