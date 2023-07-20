import { TestData } from "./src/interfaces";

export const testData: TestData = {

    //sg-0 -> sg-1
    "10.150.0.220": [{
        protocol: "TCP",
        dstIps: ["10.150.0.223"],
        rules: [
            {
                srcPorts: [""],
                dstPorts: ["50000"]
            }
        ]
    }],

    "10.150.0.221": [{
        protocol: "TCP",
        dstIps: ["10.150.0.223"],
        rules: [
            {
                srcPorts: [""],
                dstPorts: ["50000"]
            }
        ]
    }],

    "10.150.0.222": [{
        protocol: "TCP",
        dstIps: ["10.150.0.223"],
        rules: [
            {
                srcPorts: [""],
                dstPorts: ["50000"]
            }
        ]
    }],

    //sg-1 -> sg-2
    "10.150.0.223": [{
        protocol: "TCP",
        dstIps: ["10.150.0.224"],
        rules: [
            {
                srcPorts: [""],
                dstPorts: ["50001-50003"]
            }
        ]
    }],

    //sg-2 -> sg-1
    "10.150.0.224": [{
        protocol: "TCP",
        dstIps: ["10.150.0.223"],
        rules: [
            {
                srcPorts: ["43000", "43002", "43004-43006"],
                dstPorts: ["53005"]   
            },
            {
                srcPorts: ["43008", "43010", "43012-43014"],
                dstPorts: ["53011-53013"]   
            },
            {
                srcPorts: ["43016", "43017", "43018-43020"],
                dstPorts: ["53019", "53020", "53021-53023"]   
            }
        ]
    }],

    //sg-3 -> sg-5
    "10.150.0.225": [{
        protocol: "TCP",
        dstIps: ["10.150.0.228", "10.150.0.229"],
        rules: [
            {
                srcPorts: [""],
                dstPorts: ["50004", "50006", "50008-50010"]
            }
        ]
    }],

    "10.150.0.226": [{
        protocol: "TCP",
        dstIps: ["10.150.0.228", "10.150.0.229"],
        rules: [
            {
                srcPorts: [""],
                dstPorts: ["50004", "50006", "50008-50010"]
            }
        ]
    }],

    //sg-4 -> sg-0
    "10.150.0.227": [{
        protocol: "TCP",
        dstIps: ["10.150.0.220", "10.150.0.221", "10.150.0.222"],
        rules: [
            {
                srcPorts: ["41000"],
                dstPorts: ["51001"]
            },
            {
                srcPorts: ["41002"],
                dstPorts: ["51003-51005"]
            },
            {
                srcPorts: ["41006"],
                dstPorts: ["51007", "51009", "51011-51013"]
            }
        ]
    }],

    //sg-5 -> sg-2
    "10.150.0.228": [{
        protocol: "TCP",
        dstIps: ["10.150.0.224"],
        rules: [
            {
                srcPorts: ["42000-42002"],
                dstPorts: ["52003"]
            },
            {
                srcPorts: ["42004-42006"],
                dstPorts: ["52007-52009"]
            },
            {
                srcPorts: ["42010-42012"],
                dstPorts: ["52013", "52015", "52017-52019"]
            }
        ]
    }],

    "10.150.0.229": [{
        protocol: "TCP",
        dstIps: ["10.150.0.224"],
        rules: [
            {
                srcPorts: ["42000-42002"],
                dstPorts: ["52003"]
            },
            {
                srcPorts: ["42004-42006"],
                dstPorts: ["52007-52009"]
            },
            {
                srcPorts: ["42010-42012"],
                dstPorts: ["52013", "52015", "52017-52019"]
            }
        ]
    }]
}