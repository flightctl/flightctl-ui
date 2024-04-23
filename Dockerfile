FROM registry.access.redhat.com/ubi9/nodejs-18-minimal:latest as ui-build
USER root

WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY libs /app/libs
COPY apps /app/apps
COPY locales /app/locales
ENV NODE_OPTIONS='--max-old-space-size=8192'
RUN npm ci
RUN npm run build

FROM registry.access.redhat.com/ubi9/go-toolset:1.20 as proxy-build
WORKDIR /app
COPY proxy /app
USER 0
RUN go build

FROM registry.access.redhat.com/ubi9/ubi-micro
WORKDIR /app/proxy
COPY --from=ui-build /app/apps/standalone/dist /app/dist
COPY --from=proxy-build /app/flightctl-ui /app/proxy
EXPOSE 8080
CMD ./flightctl-ui
