import parse from 'json-templates';
import { variables } from "../infrastructure/var_storage/variables-storage";

const specPod = parse({
    metadata: {
        name: `{{podName}}`,
        labels: {
             component: "{{component}}",
             instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    spec: {
        containers: [{
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
        }],
        imagePullSecrets: variables.get("IMAGE_PULL_SECRETS").split(",").map(name => ({ name })),
        restartPolicy: "Never",
        volumes: [
            {
                name: "{{prefix}}-test-ports",
                configMap: {
                    name: `{{podName}}`
                }
            }
        ]
    }
})

const specSrv = parse({
    metadata: {
        name: `{{podName}}`,
        labels: {
            name: `{{podName}}`,
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    spec: {
        selector: {
            component: "{{component}}",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        },
        ports: `{{ports}}`
    }
})

const ports = parse({
    metadata: {
        name: `{{name}}`,
        labels: {
            component: "{{component}}",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`            
        }
    },
    data: {
        "ports.json": "{{ports}}"
    }
})

export const fqdnTestStend = { specPod, specSrv, ports }