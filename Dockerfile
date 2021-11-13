FROM node:alpine as build

WORKDIR /build

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build


FROM node:alpine

WORKDIR /bot

COPY package*.json .
RUN npm install

COPY --from=build /build/dist ./dist
RUN mkdir data

VOLUME [ "/bot/data" ]

ENTRYPOINT [ "npm", "start" ]
