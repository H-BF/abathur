import { V1ConfigMap } from "@kubernetes/client-node";
import parse from 'json-templates';
import { variables } from "../infrastructure/var_storage/variables-storage";

const specPod = parse({
    metadata: {
        name: `p${variables.get("PIPELINE_ID")}-{{podName}}`,
        labels: {
            component: "{{component}}",
            instance: `p${variables.get("PIPELINE_ID")}`
        },
        annotations: {
            "cni.projectcalico.org/ipAddrs": "[\"{{ip}}\"]"
        }
    },
    spec: {
        securityContext: {
            sysctls: [
                {
                    name: "net.ipv4.tcp_fin_timeout",
                    value: "15"
                },
                {
                    name: "net.ipv4.tcp_tw_reuse",
                    value: "1"
                }
            ]
        },
        initContainers: [
            {
                name: "hbf-client",
                image: `${variables.get("HBF_CLIENT_REPOSITORY")}:${variables.get("HBF_CLIENT_TAG")}`,
                securityContext: {
                    privileged: true,
                    allowPrivilegeEscalation: true,
                    runAsUser: 0
                },
                volumeMounts: [{
                    name: "hbf-client",
                    mountPath: "/app/hack/configs"
                }],
                command: [ "./bin/to-nft", "-config", "/app/hack/configs/to-nft.yaml" ]
            }
        ],
        containers: [
            {
                name: "server",
                image: `${variables.get("ABA_SERVER_REPOSITORY")}:${variables.get("ABA_SERVER_TAG")}`,
                volumeMounts: [{
                    name: "test-ports",
                    mountPath: "/usr/src/server/ports"
                }],
                imagePullPolicy: "Never",
            },
            {
                name: "client",
                image: `${variables.get("ABA_CLIENT_REPOSITORY")}:${variables.get("ABA_CLIENT_TAG")}`,
                volumeMounts: [{
                    name: "test-data",
                    mountPath: "/usr/src/client/testData"
                }],
                imagePullPolicy: "Never",
                env: [{
                    name: "REPORTER_PROTOCOL",
                    value: variables.get("REPORTER_PROTOCOL")
                },{
                    name: "REPORTER_HOST",
                    value: variables.get("REPORTER_HOST")
                },{
                    name: "REPORTER_PORT",
                    value: variables.get("REPORTER_PORT")
                }]
            }
        ],
        restartPolicy: "Never",
        volumes: [
            {
                name: "hbf-client",
                configMap: {
                    name: `p${variables.get("PIPELINE_ID")}-hbf-client`
                }
            },
            {
                name: "test-data",
                configMap: {
                    name: `p${variables.get("PIPELINE_ID")}-{{testData}}`
                }
            },
            {
                name: "test-ports",
                configMap: {
                    name: `p${variables.get("PIPELINE_ID")}-{{ports}}`
                }
            }
        ]
    }
})

const specConfMapHbfClient: V1ConfigMap = {
    metadata: {
        name: `p${variables.get("PIPELINE_ID")}-hbf-client`,
        labels: {
            component: "hbf-client",
            instance: `p${variables.get("PIPELINE_ID")}`
        }
    },
    data: {
        "to-nft.yaml":
            `
            exit-on-success: true
            graceful-shutdown: 10s
            logger:
                level: DEBUG

            extapi:
                svc:
                    def-daial-duration: 10s
                    sgroups:
                        dial-duration: 3s
                        address: p${variables.get("PIPELINE_ID")}-hbf-server:80
                        check-sync-status: 5s
            `
    }
}

const testData = parse({
    metadata: {
        name: `p${variables.get("PIPELINE_ID")}-{{name}}`,
        labels: {
            component: "{{component}}",
            instance: `p${variables.get("PIPELINE_ID")}`
        }
    },
    data: {
        "testData.json": "{{testData}}"
    }
})

const ports = parse({
    metadata: {
        name: `p${variables.get("PIPELINE_ID")}-{{name}}`,
        labels: {
            component: "{{component}}",
            instance: `p${variables.get("PIPELINE_ID")}`            
        }
    },
    data: {
        "ports.json": "{{ports}}"
    }
})

export const abaTestPod = { specPod, specConfMapHbfClient, testData, ports }