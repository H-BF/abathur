FROM node:18-alpine as builder
WORKDIR /usr/src/client
COPY *.json .
RUN npm ci
ADD . .
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/client
COPY --from=builder /usr/src/client/build ./build
ADD ./gRPC/control.proto ./gRPC/control.proto
ADD *.json .
RUN npm ci --only=production
RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.14/main" >> /etc/apk/repositories
RUN apk update
RUN apk add net-tools nftables iptables iputils-ping traceroute
CMD ["node", "./build/client.js"]