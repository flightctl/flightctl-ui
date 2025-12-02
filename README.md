# Flight Control UI

Monorepo containing UIs for [Flight Control](https://github.com/flightctl/flightctl)

## Prerequisites

- `Git`, `Node.js v22.x`, `npm v10.x`, `rsync`, `go` (>= 1.25)

## Building

### Checkout the repository and run

```shell
cd flightctl-ui
npm ci
npm run build
```

### Running Standalone UI with backend running in Kind

If backend is running in your Kind cluster, use the following command to start the UI application.
It will automatically detect your Flight Control deployment settings and it will configure the UI accordingly. (Requires `kind`, `kubectl`)

```shell
npm run dev:kind
```

See [CONFIGURATION.md](CONFIGURATION.md) for complete configuration options.

### Running Standalone UI with backend not running in Kind

If backend is not running in your Kind cluster, you need to specify your Flight Control deployment settings.

```shell
FLIGHTCTL_SERVER=<api_server_url> npm run dev
```

If the backend, or Auth provider is running self-signed certs, you will need to disable the verification via environment variables:

- `FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY='true'` - to disable verification of backend certs
- `AUTH_INSECURE_SKIP_VERIFY='true'` - to disable verification of auth server certs

or provide the CA certs:

- copy backend `ca.crt` to `./certs/ca.crt`
- copy Auth `ca.crt` to `./certs/ca_auth.crt`

See [CONFIGURATION.md](CONFIGURATION.md) for complete configuration options.

### Running UI as OCP plugin

With this option, the Flight Control UI will run as a Plugin in the OCP console.
**Note**: this setup is only for development, do not use it in Production environments!

Login to OCP cluster and run:

```shell
npm run dev:ocp
```

By default, the latest available OpenShift console image will be used. To specify a different console version, set the `CONSOLE_VERSION` environment variable.

The following console versions are confirmed to be compatible: 4.16 to 4.20.

<br />

[![Watch the demo](demo-thumbnail.png)](https://www.youtube.com/watch?v=WzNG_uWnmzk)
