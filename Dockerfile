FROM node:latest

VOLUME /app
WORKDIR /app
RUN npm install
RUN node bin/www