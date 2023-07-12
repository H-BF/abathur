FROM node:18

WORKDIR /usr/src/server
COPY . .
RUN npm install
RUN apt update && apt install -y net-tools
CMD ["npm", "run", "start:local"]