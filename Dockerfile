FROM node:alpine as build

WORKDIR /build

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build


FROM node:alpine as production

WORKDIR /bot

COPY package*.json .

RUN npm install --production &&\
    npm uninstall -g npm

COPY --from=build /build/dist .
RUN mkdir data
ENV NODE_ENV=production

VOLUME [ "/bot/data" ]

ENTRYPOINT [ "node", "/bot/index.js" ]
