FROM node:18-alpine as builder
WORKDIR /usr/src/server
COPY ./server/*.json .
RUN npm ci
ADD ./server/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/server
COPY --from=builder /usr/src/server/build ./build
ADD ./server/*.json .
RUN npm ci --only=production
RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.14/main" >> /etc/apk/repositories
RUN apk update
RUN apk add nftables iptables net-tools
CMD ["node", "./build/index.js"]