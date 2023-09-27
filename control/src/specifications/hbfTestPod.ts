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
                        cpu: variables.get("HBF_CLIENT_CPU"),
                        memory: variables.get("HBF_CLIENT_MEM")
                    },
                    requests: {
                        cpu: variables.get("HBF_CLIENT_CPU"),
                        memory: variables.get("HBF_CLIENT_MEM")
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
                        cpu: variables.get("ABA_SERVER_CPU"),
                        memory: variables.get("ABA_SERVER_MEM")
                    },
                    requests: {
                        cpu: variables.get("ABA_SERVER_CPU"),
                        memory: variables.get("ABA_SERVER_MEM")
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
                    value: variables.get("HBF_REPORTER_PROTOCOL")
                },{
                    name: "REPORTER_HOST",
                    value: variables.get("HBF_REPORTER_HOST")
                },{
                    name: "REPORTER_PORT",
                    value: variables.get("HBF_REPORTER_PORT")
                },{
                    name: "ABA_CONTROL_IP",
                    value: variables.get("ABA_CONTROL_IP")
                }, {
                    name: "ABA_CONTROL_PORT",
                    value: variables.get("ABA_CONTROL_PORT")
                }],
                resources: {
                    limits: {
                        cpu: variables.get("ABA_CLIENT_CPU"),
                        memory: variables.get("ABA_CLIENT_MEM")
                    },
                    requests: {
                        cpu: variables.get("ABA_CLIENT_CPU"),
                        memory: variables.get("ABA_CLIENT_MEM")
                    }
                }
            }
        ],
        restartPolicy: "Never",
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
            
            base-rules:
                networks: ["{{ip}}/32", "${variables.get("DNS_IP")}/32"]

            dns:
                nameservers: ["${variables.get("DNS_IP")}"]
                proto: ${variables.get("DNS_PROTOCOL")}
                port: ${variables.get("DNS_PORT")}
                dial-duration: 3s
                read-duration: 5s #default 
                write-duration: 5s #default 5s
                retries: 5 #default 1
                retry-timeout: 3s #default 1s            
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

export const hbfTestPod = { specPod, specConfMapHbfClient, testData, ports }
