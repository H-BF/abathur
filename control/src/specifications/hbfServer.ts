import { variables } from "../infrastructure/var_storage/variables-storage";
import parse from "json-templates";

const databasePod = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server-db`,
        labels: {
            component: "hbf-server-db",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    spec: {
        containers: [{
            name: "hbf-server-db",
            image: "postgres:14.8",
            ports: [{
                name: "pgsql",
                containerPort: 5432
            }],
            env: [{
                name: "POSTGRES_USER",
                value: `${variables.get("HBF_SERVER_DB_LOGIN")}`
            },
            {
                name: "POSTGRES_PASSWORD",
                value: `${variables.get("HBF_SERVER_DB_PWD")}`
            },
            {
                name: "POSTGRES_DB",
                value: `${variables.get("HBF_SERVER_DB_NAME")}`
            }],
            resources: {
                limits: {
                    cpu: "100m",
                    memory: "100Mi"
                },
                requests: {
                    cpu: "100m",
                    memory: "100Mi"
                }
            }
        }]
    }
})

const databaseSvc = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server-db`,
        labels: {
            name: "hbf-server-db",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    spec: {
        selector: {
            component: "hbf-server-db",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`            
        },
        ports:[{
            name: "pg",
            port: Number(variables.get("HBF_SERVER_DB_PORT")),
            targetPort: 5432
        }],
        type: "LoadBalancer"
    }
})

const serverPod = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server`,
        labels: {
            component: "hbf-server",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        },
        annotations: {
            "cni.projectcalico.org/ipAddrs": "[\"{{ip}}\"]"
        }
    },
    spec: {
        initContainers:[
            {
                name: "init-goose",
                image: `${variables.get("HBF_MIGRATION_REPOSITORY")}:${variables.get("HBF_MIGRATION_TAG")}`,
                resources: {
                    limits: {
                        cpu: variables.get("HBF_MIGRATION_CPU"),
                        memory: variables.get("HBF_MIGRATION_MEM")
                    },
                    requests: {
                        cpu: variables.get("HBF_MIGRATION_CPU"),
                        memory: variables.get("HBF_MIGRATION_MEM")
                    }
                },
                volumeMounts:[{
                    name: `{{prefix}}-init-goose`,
                    mountPath: "/app/start",
                }],
                command: ["/bin/sh", "/app/start/migration.sh"],
            },
            {
                name: "test-data",
                image: "postgres:14.8",
                resources: {
                    limits: {
                        cpu: "50m",
                        memory: "50Mi"
                    },
                    requests: {
                        cpu: "50m",
                        memory: "50Mi"
                    }
                },
                volumeMounts: [{
                    name: `{{prefix}}-test-data`,
                    mountPath: `/tmp/test_data`
                }],
                command: [
                    "/bin/sh",
                    "-c",
                    `psql postgres://${variables.get("HBF_SERVER_DB_LOGIN")}:${variables.get("HBF_SERVER_DB_PWD")}@{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server-db.${variables.get("NAMESPACE")}.svc.cluster.local:${variables.get("HBF_SERVER_DB_PORT")}/${variables.get("HBF_SERVER_DB_NAME")}?sslmode=disable -f /tmp/test_data/data.sql`
                ]
            }
        ],
        containers: [
            {
                name: "hbf-server",
                image: `${variables.get("HBF_SERVER_REPOSITORY")}:${variables.get("HBF_SERVER_TAG")}`,
                volumeMounts: [{
                        name: "{{prefix}}-hbf-server",
                        mountPath: "/app/hack/configs"
                }],
                command: ["./bin/sgroups", "-config", "/app/hack/configs/server.yaml"],
                ports: [{
                    name: "hbf-server",
                    containerPort: "{{port}}"
                }],
                env: [{
                    name: "SG_STORAGE_POSTGRES_URL",
                    value: `postgres://${variables.get("HBF_SERVER_DB_LOGIN")}:${variables.get("HBF_SERVER_DB_PWD")}@{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server-db.${variables.get("NAMESPACE")}.svc.cluster.local:${variables.get("HBF_SERVER_DB_PORT")}/${variables.get("HBF_SERVER_DB_NAME")}?sslmode=disable`
                },
                {
                    name: "SG_STORAGE_TYPE",
                    value: "postgres"
                }],
                resources: {
                    limits: {
                        cpu: variables.get("HBF_SERVER_CPU"),
                        memory: variables.get("HBF_SERVER_MEM")
                    },
                    requests: {
                        cpu: variables.get("HBF_SERVER_CPU"),
                        memory: variables.get("HBF_SERVER_MEM")
                    }
                }
            }
        ],
        imagePullSecrets: variables.get("IMAGE_PULL_SECRETS").split(",").map(name => ({ name })),
        volumes: [
            {
                name: `{{prefix}}-init-goose`,
                configMap: {
                     name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-goose`
                }  
            },
            {
                name: `{{prefix}}-hbf-server`,
                configMap: {
                     name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server`
                }  
            },
            {
                name: `{{prefix}}-test-data`,
                configMap: {
                    name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-test-data`
                }
            }
        ]
    }
})

const serverSvc = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server`,
        labels: {
            name: "hbf-server",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    spec: {
        selector: {
            component: "hbf-server",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        },
        ports: [{
            name: "hbf",
            port: 80,
            targetPort: "hbf-server"
        }],
        type: "ClusterIP"
    }
})

const gooseConfMap = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-goose`,
        labels: {
            name: "goose-config-map",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    data: {
        "migration.sh": `
        #!/bin/bash
        
        SG_STORAGE_POSTGRES_URL="postgres://${variables.get("HBF_SERVER_DB_LOGIN")}:${variables.get("HBF_SERVER_DB_PWD")}@{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server-db.${variables.get("NAMESPACE")}.svc.cluster.local:${variables.get("HBF_SERVER_DB_PORT")}/${variables.get("HBF_SERVER_DB_NAME")}?sslmode=disable"

        export SG_STORAGE_POSTGRES_URL=$SG_STORAGE_POSTGRES_URL

        exec /app/bin/goose -table=sgroups_db_ver postgres $SG_STORAGE_POSTGRES_URL up
        `
    }
})

const testDataConfMap = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-test-data`,
        labels: {
            name: "pqsql",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    data: {
        "data.sql": "{{data}}"
    }
})



const hbfConfMap = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server`,
        labels: {
            name: "hbf-server",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    data: {
        "server.yaml": 
            `
            logger:
                level: DEBUG
            
            metrics:
                enable: true

            healthcheck:
                enable: true

            server:
                endpoint: tcp://0.0.0.0:{{port}}
                graceful-shutdown: 30s
            `
    }
})

export const newHbfServer = { databasePod, databaseSvc, serverPod, serverSvc, gooseConfMap, testDataConfMap, hbfConfMap }