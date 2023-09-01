import parse from 'json-templates';
import { variables } from "../infrastructure/var_storage/variables-storage";

const specPod = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-{{podName}}`,
        labels: {
            component: "{{component}}",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        },
        annotations: {
            "cni.projectcalico.org/ipAddrs": "[\"{{ip}}\"]"
        }
    },
    spec: {
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
                    name: "{{prefix}}-hbf-client",
                    mountPath: "/app/hack/configs"
                }],
                resources: {
                    limits: {
                        cpu: "200m",
                        memory: "100Mi"
                    },
                    requests: {
                        cpu: "200m",
                        memory: "100Mi"
                    }
                },
                command: [ "./bin/to-nft", "-config", "/app/hack/configs/to-nft.yaml" ]

            }
        ],
        containers: [
            {
                name: "server",
                image: `${variables.get("ABA_SERVER_REPOSITORY")}:${variables.get("ABA_SERVER_TAG")}`,
                volumeMounts: [{
                    name: "{{prefix}}-test-ports",
                    mountPath: "/usr/src/server/ports"
                }],
                imagePullPolicy: "IfNotPresent",
                resources: {
                    limits: {
                        cpu: "200m",
                        memory: "500Mi"
                    },
                    requests: {
                        cpu: "200m",
                        memory: "500Mi"
                    }
                }
            },
            {
                name: "client",
                image: `${variables.get("ABA_CLIENT_REPOSITORY")}:${variables.get("ABA_CLIENT_TAG")}`,
                volumeMounts: [{
                    name: "{{prefix}}-test-data",
                    mountPath: "/usr/src/client/testData"
                }],
                imagePullPolicy: "IfNotPresent",
                env: [{
                    name: "REPORTER_PROTOCOL",
                    value: variables.get("REPORTER_PROTOCOL")
                },{
                    name: "REPORTER_HOST",
                    value: variables.get("REPORTER_HOST")
                },{
                    name: "REPORTER_PORT",
                    value: variables.get("REPORTER_PORT")
                },{
                    name: "ABA_CONTROL_IP",
                    value: variables.get("ABA_CONTROL_IP")
                }],
                resources: {
                    limits: {
                        cpu: "200m",
                        memory: "500Mi"
                    },
                    requests: {
                        cpu: "200m",
                        memory: "500Mi"
                    }
                }
            }
        ],
        restartPolicy: "IfNotPresent",
        volumes: [
            {
                name: "{{prefix}}-hbf-client",
                configMap: {
                    name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-client`
                }
            },
            {
                name: "{{prefix}}-test-data",
                configMap: {
                    name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-{{testData}}`
                }
            },
            {
                name: "{{prefix}}-test-ports",
                configMap: {
                    name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-{{ports}}`
                }
            }
        ]
    }
})

const specConfMapHbfClient = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-client`,
        labels: {
            component: "hbf-client",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
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
                        address: {{ip}}:{{port}}
                        check-sync-status: 5s
            `
    }
})

const testData = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-{{name}}`,
        labels: {
            component: "{{component}}",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    data: {
        "testData.json": "{{testData}}"
    }
})

const ports = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-{{name}}`,
        labels: {
            component: "{{component}}",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`            
        }
    },
    data: {
        "ports.json": "{{ports}}"
    }
})

export const abaTestPod = { specPod, specConfMapHbfClient, testData, ports }