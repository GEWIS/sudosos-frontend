# Build in a different image to keep the target image clean
FROM node:20 AS build
RUN corepack enable && yarn set version berry
WORKDIR /app
COPY lib/common/ lib/common/
COPY apps/point-of-sale/package.json apps/point-of-sale/
COPY ./package.json ./yarn.lock .yarnrc.yml ./
RUN yarn install
COPY apps/point-of-sale/ apps/point-of-sale/
ARG GIT_COMMIT_BRANCH
ENV VITE_GIT_COMMIT_BRANCH=${GIT_COMMIT_BRANCH}
ARG GIT_COMMIT_SHA
ENV VITE_GIT_COMMIT_SHA=${GIT_COMMIT_SHA}
RUN yarn run build-pos

# The target image that will be run
FROM nginx:alpine AS target
WORKDIR /app
COPY apps/point-of-sale/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx /app/apps/point-of-sale/dist/ /app
