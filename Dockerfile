# Build in a different image to keep the target image clean
FROM node:12 as build
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm install
COPY ./ ./
RUN cp .env.example .env && npm run build

# The target image that will be run
FROM nginx:alpine as target
WORKDIR /app
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx /app/dist/ /app
