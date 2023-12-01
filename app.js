// server.js
const express = require('express');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const path = require('path');
// if you want to change api PORT for development environment,
// you need to set also in webpack.dev.js as process.env.API_PORT
process.env.PORT = process.env.PORT || 3001;
const app = express();


app.use((req, res, next) => {

    //just for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    //for production add the url like this
    //res.setHeader('Access-Control-Allow-Origin', 'https://www.flighctl.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
app.get('/api/v1/:kind', async (req, res) => {
    try {
        const kind = req.params.kind;
        const url = `https://localhost:3333/api/v1/${kind}`;
        const cert = fs.readFileSync('certs/client-enrollment.crt');
        const key = fs.readFileSync('certs/client-enrollment.key');
        const ca = fs.readFileSync('certs/ca.crt');
        const agent = new https.Agent({ cert, key, ca });
        const response = await axios.get(url, { httpsAgent: agent });
        res.send(response.data);
    } catch (error) {
        // catch error status code from axios response

        console.error('Bad request:', error.message);
        res.status(400).send('Bad request');

        
    }
});
app.get('/api/v1/:kind/:name', async (req, res) => {
    try {
        const kind = req.params.kind;
        const name = req.params.name;
        const url = `https://localhost:3333/api/v1/${kind}/${name}`;
        const cert = fs.readFileSync('certs/client-enrollment.crt');
        const key = fs.readFileSync('certs/client-enrollment.key');
        const ca = fs.readFileSync('certs/ca.crt');
        const agent = new https.Agent({ cert, key, ca });
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
        const url = `https://localhost:3333/api/v1/${kind}/${name}`;
        const cert = fs.readFileSync('certs/client-enrollment.crt');
        const key = fs.readFileSync('certs/client-enrollment.key');
        const ca = fs.readFileSync('certs/ca.crt');
        const agent = new https.Agent({ cert, key, ca });
        const response = await axios.delete(url, { httpsAgent: agent });
        res.send(response.data);
    } catch (error) {
        // catch error status code from axios response

        console.error('Bad request:', error.message);
        res.status(400).send('Bad request'); 
    }
});
app.put('/api/v1/enrollmentrequests/:name/approval', async (req, res) => {
    try {
        const name = req.params.name;
        const url = `https://localhost:3333/api/v1/enrollmentrequests/${name}/approval`;
        const cert = fs.readFileSync('certs/client-enrollment.crt');
        const key = fs.readFileSync('certs/client-enrollment.key');
        const ca = fs.readFileSync('certs/ca.crt');
        const agent = new https.Agent({ cert, key, ca });
        const response = await axios.put(url, { httpsAgent: agent });
        res.send(response.data);
    } catch (error) {
        // catch error status code from axios response

        console.error('Bad request:', error.message);
        res.status(400).send('Bad request'); 
    }

});

app.put('/api/v1/enrollmentrequests/:name/rejection', async (req, res) => {
    try {
        const name = req.params.name;
        const url = `https://localhost:3333/api/v1/enrollmentrequests/${name}/rejection`;
        const cert = fs.readFileSync('certs/client-enrollment.crt');
        const key = fs.readFileSync('certs/client-enrollment.key');
        const ca = fs.readFileSync('certs/ca.crt');
        const agent = new https.Agent({ cert, key, ca });
        const response = await axios.put(url, { httpsAgent: agent });
        res.send(response.data);
    } catch (error) {
        // catch error status code from axios response

        console.error('Bad request:', error.message);
        res.status(400).send('Bad request'); 
    }

});

//set dist as static application folder
app.use(express.static(__dirname + '/dist'));
//serve index.html file on route '/'
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});


app.listen(process.env.PORT, () => {
    console.log('Server listening on port ' + process.env.PORT);
});