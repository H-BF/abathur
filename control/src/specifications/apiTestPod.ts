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
        containers: [{
            name: "api-tests",
            image: `${variables.get("API_TEST_REPOSITORY")}:${variables.get("API_TEST_TAG")}`,
            imagePullPolicy: "IfNotPresent",
            resources: {
                limits: {
                    cpu: variables.get("API_TEST_CPU"),
                    memory: variables.get("API_TEST_MEM")
                },
                requests: {
                    cpu: variables.get("API_TEST_CPU"),
                    memory: variables.get("API_TEST_MEM")
                }
            },
            env: [{
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
            }],
            volumeMounts: [{
                name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-api-data`,
                mountPath: `/tmp/testData`
            }]
        }],
        restartPolicy: "Never",
        volumes: [{
            name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`,
            configMap: {
                name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-wait-db`
            }
        }, {
            name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-api-data`,
            configMap: {
                name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-api-data`
            }
        }]
    }
})

const specConfMapNewmanTestData = parse({
    metadata: {
        name: `{{prefix}}-p${variables.get("PIPELINE_ID")}-api-data`,
        labels: {
            component: "teset-data",
            instance: `{{prefix}}-p${variables.get("PIPELINE_ID")}`
        }
    },
    data: {
        "swarm.json": "{{data}}"
    }
})

export const apiTestPod = { specPod, specConfMapNewmanTestData }