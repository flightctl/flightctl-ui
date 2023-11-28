# Flight Control UI

## Building

Prerequisites:
* `git`, `nodejs:18`

Checkout the repo and from within the repo run:

```
npm install
```

Copy the flightctl-server certs to proxy the api access with express (app.js)
```
mkdir certs
cp ~/.flightctl/certs/client-enrollment.crt certs 
cp ~/.flightctl/certs/client-enrollment.key certs 
cp ~/.flightctl/certs/ca.crt certs
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