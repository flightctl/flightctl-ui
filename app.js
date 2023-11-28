// server.js
const express = require('express');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const path = require('path');

const app = express();


app.use((req, res, next) => {

    //just for development
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');
    //
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/v1/:kind', async (req, res) => {
    const kind = req.params.kind;
    const url = `https://localhost:3333/api/v1/${kind}`;
    const cert = fs.readFileSync('certs/client-enrollment.crt');
    const key = fs.readFileSync('certs/client-enrollment.key');
    const ca = fs.readFileSync('certs/ca.crt');
    const agent = new https.Agent({ cert, key, ca });
    const response = await axios.get(url, { httpsAgent: agent });
    res.send(response.data);
});

//set dist as static application folder
app.use(express.static(__dirname + '/dist'));
//serve index.html file on route '/'
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});


app.listen(3001, () => {
    console.log('Server listening on port 3001');
});