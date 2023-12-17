# Flight Control UI

## Building

### Prerequisites:
* `git`, `nodejs:18`

### Checkout the repo and from within the repo run:

```
npm install
```

### Copy the flightctl-server certs to proxy the api access with express (app.js)
```
mkdir certs
cp ~/.flightctl/certs/client-enrollment.crt certs 
cp ~/.flightctl/certs/client-enrollment.key certs 
cp ~/.flightctl/certs/ca.crt certs
```

### Configure Keycloak:
- Go to the flightctl Realm clients view like: http://localhost:9080/admin/master/console/#/flightctl/clients
- select the ClientID "flightctl-ui"
- Set the Access settings URLs and redirect URIs for your UI instance
- In the left Menu, go to Users and Create the first one
- Once the user is created, go to its Credentials tab
- Set the user password
- Create the ".env" file with your values like this:
```
# flightctl-ui/.env
REACT_APP_KEYCLOAK_AUTHORITY="http://localhost:9080/realms/flightctl"
REACT_APP_KEYCLOAK_CLIENTID="flightctl-ui"
REACT_APP_KEYCLOAK_REDIRECT="http://localhost:9000"
```
**NEW keycloak requirement: Secured API by JWT validation** 
- Go to "Realm settings", "Keys" TAB
- At the key of use "SIG", get the public key
- Save it to certs/api-sig.key
```
-----BEGIN PUBLIC KEY-----
MIIBI[...]
-----END PUBLIC KEY-----
```

## Running

Start the Flight Control UI:

DEV:

```
npm run start:dev
```
PRE/PRO

```
npm run build
```

```
npm run start
```