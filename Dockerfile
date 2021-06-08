FROM node:latest as builder

WORKDIR /web

COPY package.* .
COPY yarn.* . 

RUN yarn

COPY . .

RUN yarn run build --mode=production

###

FROM nginx:alpine

COPY ./deploy/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /web/dist /usr/share/nginx/html