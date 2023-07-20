FROM node:18

WORKDIR /usr/src/client
COPY . .
RUN npm install
RUN apt update && apt install -y net-tools
RUN apt install -y nftables
RUN apt install -y iptables
CMD ["npm", "run", "start:client"]