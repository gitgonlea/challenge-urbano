FROM node:alpine AS build

WORKDIR /app

COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN yarn
RUN yarn build

#---

FROM nginx:alpine

COPY --from=build /app/build/ /var/www
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80