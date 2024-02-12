const express = require('express');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const bodyParser = require('body-parser');
const rs = require('jsrsasign');
const dotenv = require('dotenv');

dotenv.config();

//ignore ssl verification for axios
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

process.env.API_PORT = process.env.API_PORT || 3001;
process.env.FLIGHTCTL_SERVER = process.env.FLIGHTCTL_SERVER || 'https://localhost:3333';
process.env.RC_SVC = process.env.RC_SVC || 'flighctl-rc-svc:8082';

const KEYCLOAK_AUTH = process.env.BACKEND_KEYCLOAK_AUTHORITY || process.env.KEYCLOAK_AUTHORITY;
const app = express();
let key;
let pubKey;
// fi certs/api-sig.key exists, use it to verify JWT, else, obtain public key from keycloak
if (fs.existsSync('certs/api-sig.key')) {
  key = fs.readFileSync('certs/api-sig.key', 'utf8');
  pubKey = rs.KEYUTIL.getKey(key);
} else if (KEYCLOAK_AUTH) {
  axios.get(KEYCLOAK_AUTH).then(function (response) {
    key = '-----BEGIN PUBLIC KEY-----\n' + response.data.public_key + '\n-----END PUBLIC KEY-----';
    pubKey = rs.KEYUTIL.getKey(key);
  });
}
const cert = fs.readFileSync('certs/front-cli.crt');
const certkey = fs.readFileSync('certs/front-cli.key');
const ca = fs.readFileSync('certs/ca.crt');
app.use(bodyParser.json());
app.use((req, res, next) => {
  //just for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  //for production add the url like this
  //res.setHeader('Access-Control-Allow-Origin', 'https://www.flighctl.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use((req, res, next) => {
  if (KEYCLOAK_AUTH && req.method !== 'OPTIONS' && req.path.startsWith('/api')) {
    if (!req.headers.authorization) {
      console.log('No authorization header');
      res.status(401).send('Unauthorized');
      return;
    }
    // set const token from authorization header without Bearer
    const token = req.headers.authorization.split(' ')[1];
    var isValid = rs.KJUR.jws.JWS.verifyJWT(token, pubKey, { alg: ['RS256'] });
    if (!isValid) {
      console.log('Token is not valid');
      res.status(401).send('Unauthorized');
      return;
    }
  }
  next();
});

app.get('/api/v1/:kind', async (req, res) => {
  try {
    const kind = req.params.kind;
    const url = `${process.env.FLIGHTCTL_SERVER}/api/v1/${kind}`;
    const agent = new https.Agent({ cert, key: certkey, ca });
    const response = await axios.get(url, { httpsAgent: agent });
    res.send(response.data);
  } catch (error) {
    // catch error status code from axios response
    console.error('Bad request:', error.message);
    res.status(400).send('Bad request');
  }
});

app.post('/api/v1/:kind', async (req, res) => {
  try {
    const kind = req.params.kind;
    const url = `${process.env.FLIGHTCTL_SERVER}/api/v1/${kind}`;
    const agent = new https.Agent({ cert, key: certkey, ca });
    const response = await axios.post(url, req.body, { httpsAgent: agent });
    res.status(200).send(response.data);
  } catch (error) {
    // catch error status code from axios response
    console.error('Bad request: status: ', error.response.status, ', ', error.data);
    res.status(error.response.status).send(error.data);
  }
});

app.get('/api/v1/:kind/:name', async (req, res) => {
  try {
    const kind = req.params.kind;
    const name = req.params.name;
    const url = `${process.env.FLIGHTCTL_SERVER}/api/v1/${kind}/${name}`;
    const agent = new https.Agent({ cert, key: certkey, ca });
    const response = await axios.get(url, { httpsAgent: agent });
    res.send(response.data);
  } catch (error) {
    // catch error status code from axios response
    console.error('Bad request:', error.message);
    res.status(400).send('Bad request');
  }
});

app.delete('/api/v1/:kind/:name', async (req, res) => {
  try {
    const kind = req.params.kind;
    const name = req.params.name;
    const url = `${process.env.FLIGHTCTL_SERVER}/api/v1/${kind}/${name}`;
    const agent = new https.Agent({ cert, key: certkey, ca });
    const response = await axios.delete(url, { httpsAgent: agent });
    res.send(response.data);
  } catch (error) {
    // catch error status code from axios response
    console.error('Bad request:', error.message);
    res.status(400).send('Bad request');
  }
});
app.post('/api/v1/enrollmentrequests/:name/approval', async (req, res) => {
  try {
    const name = req.params.name;
    const url = `${process.env.FLIGHTCTL_SERVER}/api/v1/enrollmentrequests/${name}/approval`;
    const agent = new https.Agent({ cert, key: certkey, ca });
    console.log(req.body);
    const response = await axios.post(url, req.body, { httpsAgent: agent });
    res.status(200).send(response.data);
  } catch (error) {
    // catch error status code from axios response
    console.error('Bad request: status: ', error.response.status, ', ', error.data);
    res.status(error.response.status).send(error.data);
  }
});

app.post('/api/v1/enrollmentrequests/:name/rejection', async (req, res) => {
  try {
    const name = req.params.name;
    const url = `${process.env.FLIGHTCTL_SERVER}/api/v1/enrollmentrequests/${name}/rejection`;
    const agent = new https.Agent({ cert, key: certkey, ca });
    const response = await axios.post(url, { httpsAgent: agent });
    res.send(response.data);
  } catch (error) {
    // catch error status code from axios response
    console.error('Bad request:', error.message);
    res.status(400).send('Bad request');
  }
});
app.post('/api/v1/device/:deviceid/remotecontrol/enable', async (req, res) => {
  try {
    const deviceid = req.params.deviceid;
    const url = `${process.env.RC_SVC}/api/v1/rcagent/${deviceid}/enable`;
    console.log(url);
    const response = await axios.post(url);
    res.send(response.data);
  } catch (error) {
    // catch error status code from axios response
    console.error('Bad request:', error.message);
    res.status(400).send('Bad request');
  }
});

//set dist as static application folder
app.use((req, res, next) => {
  if (req.path !== '/') {
    const staticHandler = express.static(__dirname + '/dist');
    return staticHandler(req, res, next);
  } else {
    next();
  }
});
//serve index.html file on route '/'
app.get('*', function (req, res) {
  fs.readFile(__dirname + '/dist/index.html', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Failed reading index.html');
    }

    const script = `
      <script>
        window.KEYCLOAK_AUTHORITY = ${JSON.stringify(process.env.KEYCLOAK_AUTHORITY)}
        window.KEYCLOAK_CLIENTID = ${JSON.stringify(process.env.KEYCLOAK_CLIENTID)}
        window.KEYCLOAK_REDIRECT = ${JSON.stringify(process.env.KEYCLOAK_REDIRECT)}
      </script>
    `;

    const indexPage = data.replace('<head>', '<head>' + script);
    res.send(indexPage);
  });
});

app.listen(process.env.API_PORT, () => {
  console.log('Server listening on port ' + process.env.API_PORT);
});
