import { variables } from "../infrastructure/var_storage/variables-storage";
import parse from "json-templates";
import path from 'path';
import fs from "fs";

const specPod = parse({
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
                    value: "postgres://nkiver:nkiver@localhost:5432/postgres?sslmode=disable"
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
            },
            {
                name: "pgsql",
                image: "postgres:14.8",
                volumeMounts: [{
                    name: "{{prefix}}-pg-init",
                    mountPath: "/docker-entrypoint-initdb.d"
                }, {
                    name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`,
                    mountPath: "/tmp"
                }],
                ports: [{
                    name: "pgsql",
                    containerPort: 5432
                }],
                env: [{
                    name: "POSTGRES_USER",
                    value: "nkiver"
                },
                {
                    name: "POSTGRES_PASSWORD",
                    value: "nkiver"
                },
                {
                    name: "POSTGRES_DB",
                    value: "postgres"
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
                },
                redinessProbe: {
                    exec: {
                        command: ["sh", "/tmp/wait-db.sh"]
                    },
                    initialDelaySeconds: 5,
                    successThreshold: 1
                }
            }
        ],
        volumes: [{
            name: "{{prefix}}-hbf-server",
            configMap: {
                name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-hbf-server`
            }
        },
        {
            name: `{{prefix}}-pg-init`,
            configMap: {
                name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-pg-init`
            }
        },
        {
            name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`,
            configMap: {
                name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`
            }
        }]
    }
})

const specSrv = parse({
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
        },
        {
            name: "pg",
            port: 5430,
            targetPort: "pgsql"
        }],
        type: "LoadBalancer"
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

const pgConfMap = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-pg-init`,
        labels: {
            name: "pqsql",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    data: {
        "01-init.sql": fs.readFileSync(path.resolve(__dirname, "../../sql/init.sql"), "utf-8"),
        "02-migr.sql": fs.readFileSync(path.resolve(__dirname, "../../sql/migr-1.sql"), "utf-8"),
        "03-migr.sql": fs.readFileSync(path.resolve(__dirname, "../../sql/migr-2.sql"), "utf-8"),
        "04-data.sql": "{{data}}"
    }
})


const specConfMapWaitDb = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`,
        labels: {
            component: "wait-db",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`            
        }
    },
    data: {
        "wait-db.sh": `
        #!/bin/sh

        max_attempts=12
        attempts=0
    
        until [ "$(psql postgres://nkiver:nkiver@localhost:5432/postgres?sslmode=disable -c "SELECT COUNT(*) FROM sgroups.tbl_sg_rule;" -t -A)" -gt 0 ]; do
        attempts=$((attempts+1))
        if [ $attempts -gt $max_attempts ]; then
          echo "Превышено максимальное количество попыток ожидания"
          exit 1
        fi
          echo "Ожидание не пустой таблицы 'sgroups.tbl_sg_rule' в базе данных в Pod hbf-server..."
          sleep 5
        done
        `
    }
})

export const hbfServer = { specPod, specSrv, hbfConfMap, pgConfMap, specConfMapWaitDb }