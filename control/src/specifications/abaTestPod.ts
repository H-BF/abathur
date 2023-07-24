import { V1Pod, V1ConfigMap } from "@kubernetes/client-node";
import parse from 'json-templates';
import fs from 'fs';

const specPod = parse({
    metadata: {
        name: "{{podName}}",
        labels: {
            name: "{{labelName}}",
            instance: `${process.env.PIPELINE_ID}`
        },
        annotations: {
            "cni.projectcalico.org/ipAddrs": "[\"{{ip}}\"]"
        }
    },
    spec: {
        containers: [
            {
                name: "nginx",
                image: "nginx:latest",
                volumeMounts: [{
                    name: "nginx",
                    mountPath: "/etc/nginx"
                }]
            },
            {
                name: "server",
                image: "abathur_server",
                imagePullPolicy: "Never"
            },
            {
                name: "client",
                image: "abathur_client",
                volumeMounts: [{
                    name: "test-data",
                    mountPath: "/usr/src/client/testData"
                }],
                imagePullPolicy: "Never"
            },
            {
                name: "hbf-client",
                image: `fraima/hbf-client:${process.env.HBF_CLIENT_VERSION}`,
                securityContext: {
                    privileged: true
                },
                volumeMounts: [{
                    name: "hbf-client",
                    mountPath: "/app/hack/configs"
                }],
                command: [ "./bin/to-nft", "-config", "/app/hack/configs/to-nft.yaml" ]
            }
        ],
        restartPolicy: "Never",
        volumes: [
            {
                name: "nginx",
                configMap: {
                    name: "nginx"
                }
            }, 
            {
                name: "hbf-client",
                configMap: {
                    name: "hbf-client"
                }
            },
            {
                name: "test-data",
                configMap: {
                    name: "{{testData}}"
                }
            }
        ]
    }
})

const specConfMapHbfClient: V1ConfigMap = {
    metadata: {
        name: "hbf-client",
        labels: {
            name: "hbf-client",
            instance: `${process.env.PIPELINE_ID}`
        }
    },
    data: {
        "to-nft.yaml":
            `
            graceful-shutdown: 10s
            logger:
                level: INFO

            extapi:
                svc:
                    def-daial-duration: 10s
                    sgroups:
                        dial-duration: 3s
                        address: tcp://193.32.219.99:9000
                        check-sync-status: 5s
            `
    }
}

const specConfMapNginx: V1ConfigMap = {
    metadata: {
        name: "nginx",
        labels: {
            name: "nginx",
            instance: `${process.env.PIPELINE_ID}`
        }
    },
    data: {
        "nginx.conf":
        `
        user www-data;        
        worker_processes auto;
        pid /run/nginx.pid;
        include /etc/nginx/modules-enabled/*.conf;

        events {
                worker_connections 30000;
                # multi_accept on;
        }

        http {
                log_format custom '$remote_addr:$remote_port src: $http_src_ip:$http_src_port / dst: $http_dst_ip:$http_dst_port / protocol: $http_protocol';

                server {
                    listen 50000-55000;
                    http2 on;
                    
                    location / {
                        grpc_pass grpc://127.0.0.1:9091;
                        grpc_set_header dst-port $http_dst_port;
                    } 
                }

                server {
                    listen 80;
                    http2 on;

                    location / {
                        set $port "";

                        if ($http_src_port != "") {
                            set $port :$http_src_port;
                        } 

                        grpc_bind $http_src_ip$port;
                        grpc_pass grpc://$http_dst_ip:$http_dst_port;
                        grpc_set_header dst-port $http_dst_port;
                    }
                }

                sendfile on;
                tcp_nopush on;
                types_hash_max_size 2048;

                # include /etc/nginx/mime.types;
                default_type application/octet-stream;


                # ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
                # ssl_prefer_server_ciphers on;

                access_log /var/log/nginx/access.log custom;
                error_log /var/log/nginx/error.log;


                gzip on;

                include /etc/nginx/conf.d/*.conf;
                include /etc/nginx/sites-enabled/*;
        }
        `
    }
}

const testData = parse({
    metadata: {
        name: "{{name}}",
        labels: {
            name: "{{lname}}",
            instance: `${process.env.PIPELINE_ID}`
        }
    },
    data: {
        "testData.json": "{{testData}}"
    }
})

export const abaTestPod = { specPod, specConfMapHbfClient, specConfMapNginx, testData }