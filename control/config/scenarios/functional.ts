import { V1ConfigMap } from "@kubernetes/client-node"
import { hbfTestPod } from "../../src/specifications/hbfTestPod"
import { hbfServer } from "../../src/specifications/hbfServer"

// const prefix = 'func'

// export const functional = {
//     prefix: prefix,
//     sharedConfigMaps: [ 
//         hbfServer.hbfConfMap({
//             prefix: prefix,
//             port: 9006
//         }) as V1ConfigMap,
//         hbfServer.pgConfMap({prefix: prefix}) as V1ConfigMap,
//         abaTestPod.specConfMapHbfClient({
//             prefix: prefix,
//             ip: "29.64.0.232",
//             port: 9006 
//         }) as V1ConfigMap
//     ],
//     hbfServer: {
//         ip: "29.64.0.232",
//         port: 9006
//     }
// }