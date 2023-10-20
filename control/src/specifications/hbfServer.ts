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
                startupProbe: {
                    exec: {
                        command: ["sh", "/tmp/wait-db.sh"]
                    },
                    initialDelaySeconds: 10,
                    timeoutSeconds: 5,
                    successThreshold: 1,
                    failureThreshold: 5
                },
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
        "01-init.sql": fs.readFileSync(path.resolve(__dirname, "../../sql/hbf_server/init.sql"), "utf-8"),
        "02-migr.sql": fs.readFileSync(path.resolve(__dirname, "../../sql/hbf_server/migr-1.sql"), "utf-8"),
        "03-migr.sql": fs.readFileSync(path.resolve(__dirname, "../../sql/hbf_server/migr-2.sql"), "utf-8"),
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
        echo "Проверяем что в таблице 'sgroups.tbl_sg_rule' есть хоть одна строка"
        count=$(psql postgres://nkiver:nkiver@localhost:5432/postgres?sslmode=disable -c "SELECT COUNT(*) FROM (SELECT 1 FROM sgroups.tbl_sg_rule UNION ALL SELECT 1 FROM sgroups.tbl_fqdn_rule) subquery;" -t -A)
        echo "Количество строк в таблице 'sgroups.tbl_sg_rule': $count"
        
        if [ "$count" -gt 0 ]; then
            echo "more"
            exit 0
        else
            echo "less"
            exit 1
        fi
        `
    }
})

export const hbfServer = { specPod, specSrv, hbfConfMap, pgConfMap, specConfMapWaitDb }