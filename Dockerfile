FROM node:alpine as build

WORKDIR /build

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build


FROM alpine:latest as runner

WORKDIR /bot

COPY package*.json .

RUN apk update &&\
    apk add --no-cache nodejs npm &&\
    npm install --production &&\
    apk del npm

COPY --from=build /build/dist .
RUN mkdir data
ENV NODE_ENV=production

VOLUME [ "/bot/data" ]

ENTRYPOINT [ "node", "/bot/index.js" ]
