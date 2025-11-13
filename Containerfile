FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest as ui-build
USER root
RUN microdnf install -y rsync

WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY libs /app/libs
COPY apps /app/apps
ENV NODE_OPTIONS='--max-old-space-size=8192'
RUN npm ci
RUN npm run build

FROM registry.access.redhat.com/ubi9/go-toolset:1.24.6-1762373805 as proxy-build
WORKDIR /app
COPY proxy /app
USER 0
RUN CGO_ENABLED=1 CGO_CFLAGS=-flto GOEXPERIMENT=strictfipsruntime go build

FROM quay.io/flightctl/flightctl-base:9.6-1762316544
COPY --from=ui-build /app/apps/standalone/dist /app/proxy/dist
COPY --from=proxy-build /app/flightctl-ui /app/proxy
WORKDIR /app/proxy
LABEL \
  com.redhat.component="flightctl-ui-container" \
  description="Flight Control User Interface Service" \
  io.k8s.description="Flight Control User Interface Service" \
  io.k8s.display-name="Flight Control UI" \
  name="flightctl-ui" \
  summary="Flight Control User Interface Service"
EXPOSE 8080
CMD ./flightctl-ui
