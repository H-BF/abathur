import parse from 'json-templates';
import { variables } from "../infrastructure/var_storage/variables-storage";

const specPodHbfClientIsInitContainer = parse({
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
                },
                env: [{
                    name: "LOG_TYPE",
                    value: variables.get("LOG_TYPE")
                }, {
                    name: "LOG_LVL",
                    value: variables.get("LOG_LVL")
                }]
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
                    name: "ABA_CONTORL_PROXY_PROTOCOL",
                    value: variables.get("ABA_PROXY_PROTOCOL")
                },{
                    name: "ABA_CONTORL_PROXY_PORT",
                    value: variables.get("ABA_PROXY_PORT")
                },{
                    name: "ABA_CONTROL_IP",
                    value: variables.get("ABA_CONTROL_IP")
                }, {
                    name: "ABA_CONTROL_PORT",
                    value: variables.get("ABA_CONTROL_PORT")
                }, {
                    name: "LOG_TYPE",
                    value: variables.get("LOG_TYPE")
                }, {
                    name: "LOG_LVL",
                    value: variables.get("LOG_LVL")
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
        imagePullSecrets: variables.get("IMAGE_PULL_SECRETS").split(",").map(name => ({ name })),
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

const specPodHbfClientIsContainer = parse({
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
        containers: [
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
            },
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
                },
                env: [{
                    name: "LOG_TYPE",
                    value: variables.get("LOG_TYPE")
                }, {
                    name: "LOG_LVL",
                    value: variables.get("LOG_LVL")
                }]
            },
            {
                name: "client",
                image: `${variables.get("ABA_CLIENT_REPOSITORY")}:${variables.get("ABA_CLIENT_TAG")}`,
                volumeMounts: [{
                    name: "{{prefix}}-test-data",
                    mountPath: "/usr/src/client/testData"
                }],
                imagePullPolicy: "IfNotPresent",
                securityContext: { 
                    privileged: true
                },
                env: [{
                    name: "ABA_CONTORL_PROXY_PROTOCOL",
                    value: variables.get("ABA_PROXY_PROTOCOL")
                },{
                    name: "ABA_CONTORL_PROXY_PORT",
                    value: variables.get("ABA_PROXY_PORT")
                },{
                    name: "ABA_CONTROL_IP",
                    value: variables.get("ABA_CONTROL_IP")
                }, {
                    name: "ABA_CONTROL_PORT",
                    value: variables.get("ABA_CONTROL_PORT")
                }, {
                    name: "LOG_TYPE",
                    value: variables.get("LOG_TYPE")
                }, {
                    name: "LOG_LVL",
                    value: variables.get("LOG_LVL")
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
        imagePullSecrets: variables.get("IMAGE_PULL_SECRETS").split(",").map(name => ({ name })),
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

const specPodWithoutHBFAgent = parse({
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
                },
                env: [{
                    name: "LOG_TYPE",
                    value: variables.get("LOG_TYPE")
                }, {
                    name: "LOG_LVL",
                    value: variables.get("LOG_LVL")
                }]
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
                    name: "ABA_CONTORL_PROXY_PROTOCOL",
                    value: variables.get("ABA_PROXY_PROTOCOL")
                },{
                    name: "ABA_CONTORL_PROXY_PORT",
                    value: variables.get("ABA_PROXY_PORT")
                },{
                    name: "ABA_CONTROL_IP",
                    value: variables.get("ABA_CONTROL_IP")
                }, {
                    name: "ABA_CONTROL_PORT",
                    value: variables.get("ABA_CONTROL_PORT")
                }, {
                    name: "LOG_TYPE",
                    value: variables.get("LOG_TYPE")
                }, {
                    name: "LOG_LVL",
                    value: variables.get("LOG_LVL")
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
        imagePullSecrets: variables.get("IMAGE_PULL_SECRETS").split(",").map(name => ({ name })),
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
            exit-on-success: {{exitOnSuccess}}
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
                networks: ["{{ip}}/32", "${variables.get("DNS_IP")}/32", "${variables.get("ABA_CONTROL_IP")}/32"]

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

export const hbfTestStend = { 
    specPodHbfClientIsInitContainer,
    specPodHbfClientIsContainer,
    specPodWithoutHBFAgent,
    specConfMapHbfClient,
    testData,
    ports 
}
