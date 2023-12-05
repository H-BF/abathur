FROM node:18-alpine as builder
WORKDIR /usr/src/server
COPY *.json .
RUN npm ci
ADD . .
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/server
COPY --from=builder /usr/src/server/build ./build
ADD *.json .
RUN npm ci --only=production
RUN apt update && apt install -y nftables iptables net-tools
CMD ["node", "./build/index.js"]