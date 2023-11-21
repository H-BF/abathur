FROM node:18

WORKDIR /usr/src/client
COPY . .
RUN npm install
RUN apt update && apt install -y net-tools nftables iptables iputils-ping traceroute
CMD ["npm", "run", "start:client"]