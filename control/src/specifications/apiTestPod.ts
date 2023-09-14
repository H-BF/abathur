import { variables } from "../infrastructure/var_storage/variables-storage";
import parse from "json-templates";

const specPod = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-api-tests`,
        labels: {
            component: "api-tests",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        },
        annotations: {
            "cni.projectcalico.org/ipAddrs": "[\"{{ip}}\"]"
        }
    },
    spec: {
        initContainers: [{
            name: "wait-db",
            image: "postgres:14.8",
            command: ["sh", "/tmp/wait-db.sh"],
            volumeMounts: [{
                name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`,
                mountPath: "/tmp"
            }]
        }],
        containers: [{
            name: "api-tests",
            image: `${variables.get("API_TEST_REPOSITORY")}:${variables.get("API_TEST_TAG")}`,
            imagePullPolicy: "IfNotPresent",
            env: [{
                name: "HBF_HOST",
                value: "{{hbfServerIP}}"
            },{
                name: "HBF_PORT",
                value: "{{hbfServerPort}}"
            }, {
                name: "REPORTER_HOST",
                value: `${variables.get("API_REPORTER_HOST")}`
            }, {
                name: "REPORTER_PORT",
                value: `${variables.get("API_REPORTER_PORT")}`
            }, {
                name: "REPORTER_PROTOCOL",
                value: `${variables.get("API_REPORTER_PROTOCOL")}`
            }, {
                name: "ABA_CONTROL_IP",
                value: `${variables.get("ABA_CONTROL_IP")}`
            }, {
                name: "ABA_CONTROL_PORT",
                value: `${variables.get("ABA_CONTROL_PORT")}`
            }]
        }],
        restartPolicy: "Never",
        volumes: [{
            name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`,
            configMap: {
                name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`
            }
        }]
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
    
        until [ "$(psql postgres://nkiver:nkiver@{{hbfServerIP}}:5432/postgres?sslmode=disable -c "SELECT COUNT(*) FROM sgroups.tbl_sg_rule;" -t -A)" -gt 0 ]; do
          echo "Ожидание не пустой таблицы 'sgroups.tbl_sg_rule' в базе данных в Pod hbf-server..."
          sleep 5
        done
    
        echo "Таблица 'sgroups.tbl_sg_rule' в базе данных в Pod hbf-server отсутствует. Продолжение работы основного контейнера..."
        `
    }
})

export const apiTestPod = { specPod, specConfMapWaitDb }