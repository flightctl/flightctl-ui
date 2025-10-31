# Flight Control UI configuration

This document describes all environment variables and configuration options available for the Flight Control UI.

## Feature toggles

| Variable               | Description                               | Default | Values          |
| ---------------------- | ----------------------------------------- | ------- | --------------- |
| `ENABLE_ORGANIZATIONS` | Enable/disable organizations support      | `false` | `true`, `false` |
| `ENABLE_CLI_ARTIFACTS` | Enable/disable CLI download functionality | `true`  | `true`, `false` |
| `ENABLE_ALERTMANAGER`  | Enable/disable alerts functionality       | `true`  | `true`, `false` |

## Backend configuration

| Variable                                | Description                          | Default                  | Values                                 |
| --------------------------------------- | ------------------------------------ | ------------------------ | -------------------------------------- |
| `BASE_UI_URL`                           | Base URL for UI application          | `http://localhost:9000`  | `https://ui.flightctl.example.com`     |
| `FLIGHTCTL_SERVER`                      | Flight Control API server URL        | `https://localhost:3443` | `https://api.flightctl.example.com`    |
| `FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY` | Skip backend server TLS verification | `false`                  | `true`, `false`                        |
| `FLIGHTCTL_CLI_ARTIFACTS_SERVER`        | CLI artifacts server URL             | `http://localhost:8090`  | `https://cli.flightctl.example.com`    |
| `FLIGHTCTL_ALERTMANAGER_PROXY`          | AlertManager proxy server URL        | `https://localhost:8443` | `https://alerts.flightctl.example.com` |
| `AUTH_INSECURE_SKIP_VERIFY`             | Skip auth server TLS verification    | `false`                  | `true`, `false`                        |
| `TLS_CERT`                              | Path to TLS certificate              | _(empty)_                | `/path/to/server.crt`                  |
| `TLS_KEY`                               | Path to TLS private key              | _(empty)_                | `/path/to/server.key`                  |
| `API_PORT`                              | UI proxy server port                 | `3001`                   | `8080`, `3000`, etc.                   |
| `IS_OCP_PLUGIN`                         | Run as OpenShift Console plugin      | `false`                  | `true`, `false`                        |
| `IS_RHEM`                               | Red Hat Enterprise Mode              | _(empty)_                | `true`, `false`                        |

## Configuration examples

```shell
# Use auto-detection of all configuration settings
npm run dev:kind
```

```shell
# Use auto-detection and override desired settings
ENABLE_CLI_ARTIFACTS=false npm run dev:kind
```

```shell
# Use remote backend and custom settings
FLIGHTCTL_SERVER=https://flightctl.prod.example.com \
ENABLE_ORGANIZATIONS=false \
ENABLE_CLI_ARTIFACTS=false \
npm run dev
```
