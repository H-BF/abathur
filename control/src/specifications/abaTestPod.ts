import { V1ConfigMap } from "@kubernetes/client-node";
import parse from 'json-templates';

const specPod = parse({
    metadata: {
        name: `p${process.env.PIPELINE_ID}-{{podName}}`,
        labels: {
            component: "{{component}}",
            instance: `p${process.env.PIPELINE_ID}`
        },
        annotations: {
            "cni.projectcalico.org/ipAddrs": "[\"{{ip}}\"]"
        }
    },
    spec: {
        securityContext: {
            sysctls: [
                {
                    name: "net.ipv4.tcp_fin_timeout",
                    value: "15"
                },
                {
                    name: "net.ipv4.tcp_tw_reuse",
                    value: "1"
                }
            ]
        },
        initContainers: [
            {
                name: "hbf-client",
                image: `harbor.wildberries.ru/swarm/swarm/swarm/sgroups/to-nft:${process.env.HBF_VERSION}`,
                securityContext: {
                    privileged: true,
                    allowPrivilegeEscalation: true,
                    runAsUser: 0
                },
                volumeMounts: [{
                    name: "hbf-client",
                    mountPath: "/app/hack/configs"
                }],
                command: [ "./bin/to-nft", "-config", "/app/hack/configs/to-nft.yaml" ]
            }
        // {
        //     name: "kernel-config",
        //     image: "busybox",
        //     command: ["sh", "-c", "sysctl -w net.ipv4.tcp_fin_timeout=15 && sysctl -w net.ipv4.tcp_tw_reuse=1"],
        //     securityContext: {
        //         privileged: true
        //     }
        // }
        ],
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
                imagePullPolicy: "Never",
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
        ],
        restartPolicy: "Never",
        volumes: [
            {
                name: "nginx",
                configMap: {
                    name: `p${process.env.PIPELINE_ID}-nginx`
                }
            }, 
            {
                name: "hbf-client",
                configMap: {
                    name: `p${process.env.PIPELINE_ID}-hbf-client`
                }
            },
            {
                name: "test-data",
                configMap: {
                    name: `p${process.env.PIPELINE_ID}-{{testData}}`
                }
            }
        ]
    }
})

const specConfMapHbfClient: V1ConfigMap = {
    metadata: {
        name: `p${process.env.PIPELINE_ID}-hbf-client`,
        labels: {
            component: "hbf-client",
            instance: `p${process.env.PIPELINE_ID}`
        }
    },
    data: {
        "to-nft.yaml":
            `
            exit-on-success: true
            graceful-shutdown: 10s
            logger:
                level: DEBUG

            extapi:
                svc:
                    def-daial-duration: 10s
                    sgroups:
                        dial-duration: 3s
                        address: p${process.env.PIPELINE_ID}-hbf-server:80
                        check-sync-status: 5s
            `
    }
}

const specConfMapNginx: V1ConfigMap = {
    metadata: {
        name: `p${process.env.PIPELINE_ID}-nginx`,
        labels: {
            component: "nginx",
            instance: `p${process.env.PIPELINE_ID}`
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
        name: `p${process.env.PIPELINE_ID}-{{name}}`,
        labels: {
            component: "{{component}}",
            instance: `p${process.env.PIPELINE_ID}`
        }
    },
    data: {
        "testData.json": "{{testData}}"
    }
})

export const abaTestPod = { specPod, specConfMapHbfClient, specConfMapNginx, testData }