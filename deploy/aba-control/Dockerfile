FROM node:18 as builder
WORKDIR /usr/src/app
COPY ./control/ .
RUN npm ci
RUN npm run build

FROM node:18

WORKDIR /usr/src/control
COPY --from=builder /usr/src/app/build .
COPY --from=builder /usr/src/app/gRPC/control.proto ../gRPC/
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/sql ./sql
CMD ["node", "index.js"]