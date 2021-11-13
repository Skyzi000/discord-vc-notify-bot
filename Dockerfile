FROM node:alpine as build

WORKDIR /build

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build


FROM node:alpine as module

WORKDIR /module

COPY package*.json .
RUN npm install --production


FROM alpine:latest as production

ENV NODE_ENV=production

# mkdir data
WORKDIR /bot/data
WORKDIR /bot

RUN apk update &&\
    apk add --no-cache libstdc++

# copy latest nodejs
COPY --from=module /usr/local/ /usr/local/
# copy modules
COPY --from=module /module/node_modules ./node_modules
# copy app
COPY --from=build /build/dist .

VOLUME [ "/bot/data" ]

ENTRYPOINT [ "node", "/bot/index.js" ]
