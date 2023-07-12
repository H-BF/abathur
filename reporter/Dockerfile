FROM node:18

WORKDIR /usr/src/reporter
COPY . .
RUN npm install
RUN apt update && apt install -y net-tools
CMD ["npm", "run", "start:reporter"] 