FROM node:18 as builder
WORKDIR /usr/src/app
COPY ./client/ .
RUN npm ci
RUN npm run build

FROM node:18
RUN apt update
RUN apt install -y curl net-tools nftables iptables tcpdump iproute2 iputils-ping dnsutils traceroute

WORKDIR /usr/src/client
COPY --from=builder /usr/src/app/build .
COPY --from=builder /usr/src/app/gRPC/control.proto ../gRPC/
COPY --from=builder /usr/src/app/node_modules ./node_modules
CMD ["node", "client.js"]