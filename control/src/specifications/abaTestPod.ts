import { V1ConfigMap } from "@kubernetes/client-node";
import parse from 'json-templates';

const specPod = parse({
    metadata: {
        name: `p${process.env.PIPELINE_ID}-{{podName}}`,
        labels: {
            component: "{{component}}",
            instance: `p${process.env.PIPELINE_ID}`
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
                image: `harbor.wildberries.ru/swarm/swarm/swarm/sgroups/to-nft:${process.env.HBF_VERSION}`,
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
                image: "abathur_server",
                volumeMounts: [{
                    name: "test-ports",
                    mountPath: "/usr/src/server/ports"
                }],
                imagePullPolicy: "Never",
            },
            {
                name: "client",
                image: "abathur_client",
                volumeMounts: [{
                    name: "test-data",
                    mountPath: "/usr/src/client/testData"
                }],
                imagePullPolicy: "Never"
            },
        ],
        restartPolicy: "Never",
        volumes: [
            {
                name: "hbf-client",
                configMap: {
                    name: `p${process.env.PIPELINE_ID}-hbf-client`
                }
            },
            {
                name: "test-data",
                configMap: {
                    name: `p${process.env.PIPELINE_ID}-{{testData}}`
                }
            },
            {
                name: "test-ports",
                configMap: {
                    name: `p${process.env.PIPELINE_ID}-{{ports}}`
                }
            }
        ]
    }
})

const specConfMapHbfClient: V1ConfigMap = {
    metadata: {
        name: `p${process.env.PIPELINE_ID}-hbf-client`,
        labels: {
            component: "hbf-client",
            instance: `p${process.env.PIPELINE_ID}`
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
                        address: p${process.env.PIPELINE_ID}-hbf-server:80
                        check-sync-status: 5s
            `
    }
}

const testData = parse({
    metadata: {
        name: `p${process.env.PIPELINE_ID}-{{name}}`,
        labels: {
            component: "{{component}}",
            instance: `p${process.env.PIPELINE_ID}`
        }
    },
    data: {
        "testData.json": "{{testData}}"
    }
})

const ports = parse({
    metadata: {
        name: `p${process.env.PIPELINE_ID}-{{name}}`,
        labels: {
            component: "{{component}}",
            instance: `p${process.env.PIPELINE_ID}`            
        }
    },
    data: {
        "ports.json": "{{ports}}"
    }
})

export const abaTestPod = { specPod, specConfMapHbfClient, testData, ports }