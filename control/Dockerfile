FROM node:18-alpine as builder
WORKDIR /usr/src/control
COPY *.json .
RUN npm ci
ADD . .
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/control
COPY --from=builder /usr/src/control/build ./build
ADD ./gRPC/control.proto ./gRPC/control.proto
ADD ./sql ./sql
ADD ./test_data ./test_data
ADD *.json .
RUN npm ci --only=production
CMD ["node", "./build/index.js"]