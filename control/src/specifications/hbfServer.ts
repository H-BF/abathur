import { V1Pod, V1Service, V1ConfigMap } from "@kubernetes/client-node";

const specPod = {
    metadata: {
        name: `${process.env.PIPELINE_ID}-hbf-server`,
        labels: {
            component: "hbf-server",
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
                }],
                readinessProbe: {
                    initialDelaySeconds: 1,
                    periodSeconds: 2,
                    timeoutSeconds: 1,
                    successThreshold: 1,
                    failureThreshold: 1,
                    httpGet: {
                        scheme: "HTTP",
                        path: "/v1/sync/status",
                        port: 9006
                    }
                }
            }
        ],
        volumes: [{
            name: "hbf-server",
            configMap: {
                name: `${process.env.PIPELINE_ID}-hbf-server`
            }
        }]
    }
}

const specSrv: V1Service = {
    metadata: {
        name: `${process.env.PIPELINE_ID}-hbf-server`,
        labels: {
            name: "hbf-server",
            instance: `${process.env.PIPELINE_ID}`
        }
    },
    spec: {
        selector: {
            component: "hbf-server",
            instance: `${process.env.PIPELINE_ID}`
        },
        ports: [{
            port: 80,
            targetPort: "hbf-server"
        }]
    }
}

const specConfMap: V1ConfigMap = {
    metadata: {
        name: `${process.env.PIPELINE_ID}-hbf-server`,
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