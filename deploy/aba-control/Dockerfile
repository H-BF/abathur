FROM node:18-alpine as builder
WORKDIR /usr/src/control
COPY ./control/*.json .
RUN npm ci
ADD ./control/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/control
COPY --from=builder /usr/src/control/build ./build
ADD ./control/gRPC/control.proto ./gRPC/control.proto
ADD ./control/sql ./sql
ADD ./control/test_data ./test_data
ADD ./control/*.json .
RUN npm ci --only=production
CMD ["node", "./build/index.js"]