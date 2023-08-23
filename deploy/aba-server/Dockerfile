FROM node:18 as builder
WORKDIR /usr/src/app
COPY ./control/ .
RUN npm ci
RUN npm run build

FROM node:18
RUN apt update
RUN apt install -y nftables iptables net-tools

WORKDIR /usr/src/aba-server
COPY --from=builder /usr/src/app/build .
COPY --from=builder /usr/src/app/node_modules ./node_modules
CMD ["node", "server.js"]