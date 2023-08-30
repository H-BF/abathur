import { V1ConfigMap } from "@kubernetes/client-node"
import { abaTestPod } from "../../src/specifications/abaTestPod"
import { hbfServer } from "../../src/specifications/hbfServer"

const prefix = 'func'

export const functional = {
    prefix: prefix,
    sharedConfigMaps: [ 
        hbfServer.hbfConfMap({prefix: prefix}) as V1ConfigMap,
        hbfServer.pgConfMap({prefix: prefix}) as V1ConfigMap,
        abaTestPod.specConfMapHbfClient({prefix: prefix}) as V1ConfigMap
    ],
    hbfServer: {
        ip: "29.64.0.232"
    }
}