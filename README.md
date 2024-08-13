# Flight Control UI

Monorepo containing UIs for [flightctl](https://github.com/flightctl/flightctl)

### Prerequisites:
* `git`, `nodejs:18`, `npm:10`, `rsync`

## Building

### Checkout the repo and from within the repo run:

```
npm ci
npm run build
```

## Running

First, copy the flightctl-server certs to proxy the API requests
```
mkdir certs
cat ~/.flightctl/client.yaml | yq '.service.certificate-authority-data' | base64 -d > certs/ca.crt
```

### Running Standalone UI with backend running in Kind

Choose one of the two options to run the UI application

1. With auth disabled:
  ```
  npm run dev:kind
  ```

2. With auth enabled:

  ```
  npm run dev:kind:auth
  ```

### Running Standalone UI with backend not running in Kind
- If backend is not running in your Kind cluster, you need to specify the API endpoint

```
FLIGHTCTL_SERVER=<api_server_url> npm run dev
```

### Running UI as OCP plugin

Login to OCP cluster and run:

```
npm run dev:ocp 
```

### (Optional) Configure Keycloak:
- Go to the flightctl Realm clients view like: http://localhost:8080/admin/master/console/#/flightctl/clients
- select the ClientID "flightctl"
- Set the Web origins URLs and redirect URIs for your UI instance
- Create the ".env" file with your values like this:
```
# flightctl-ui/.env
KEYCLOAK_AUTHORITY="http://localhost:8080/realms/flightctl"
KEYCLOAK_CLIENTID="flightctl-ui"
KEYCLOAK_REDIRECT="http://localhost:9000"
```