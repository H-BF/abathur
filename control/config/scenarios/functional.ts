import { abaTestPod } from "../../src/specifications/abaTestPod"
import { hbfServer } from "../../src/specifications/hbfServer"

const prefix = 'func'

export const scenario = {
    functional: {
        configMaps: [ 
            //common
            hbfServer.hbfConfMap,
            hbfServer.pgConfMap,
            abaTestPod.specConfMapHbfClient
        ],
        hbfServer: {
            prefix: prefix
        }
    }
}