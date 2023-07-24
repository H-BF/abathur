import { V1Pod, V1Service, V1ConfigMap } from "@kubernetes/client-node";
import fs from 'fs';

const specPod = {
    metadata: {
        name: "hbf-server",
        labels: {
            "app.kubernetes.io/name": "hbf-server",
            instance: `${process.env.PIPELINE_ID}`
        }
    },
    spec: {
        containers: [
            {
                name: "hbf-server",
                image: `fraima/hbf-server:${process.env.HBF_SERVER_VERSION}`,
                securityContext: {
                    privileged: true
                },
                volumeMounts: [{
                        name: "hbf-server",
                        mountPath: "/app/hack/configs"
                }],
                command: ["./bin/sgroups", "-config", "/app/hack/configs/server.yaml"],
                ports: [{
                    name: "hbf-server",
                    containerPort: 9006
                }]
            }
        ],
        volumes: [{
            name: "hbf-server",
            configMap: {
                name: "hbf-server"
            }
        }]
    }
}

const specSrv: V1Service = {
    metadata: {
        name: "hbf-server",
        labels: {
            name: "hbf-server",
            instance: `${process.env.PIPELINE_ID}`
        }
    },
    spec: {
        selector: {
            "app.kubernetes.io/name": "hbf-server"
        },
        ports: [{
            port: 80,
            targetPort: "hbf-server"
        }]
    }
}

const specConfMap: V1ConfigMap = {
    metadata: {
        name: "hbf-server",
        labels: {
            name: "hbf-server",
            instance: `${process.env.PIPELINE_ID}`
        }
    },
    data: {
        "server.yaml": 
            `
            logger:
                level: INFO
            
            metrics:
                enable: true

            healthcheck:
                enable: true

            server:
                endpoint: tcp://0.0.0.0:9006
                graceful-shutdown: 30s
            `
    }
}


export const hbfServer = { specPod, specSrv, specConfMap }