#!/usr/bin/env node
'use strict'
const app = require('express')()
const authenticate = require('./src/authenticate')
const params = require('./src/params')
const proxy = require('./src/proxy')
const spdy = require('spdy')
const fs = require('fs')

// ssl doesn't make sense when we have ssl termination.
/*
const ssl = {
    key: fs.readFileSync('./cert/privkey.pem'),
    cert: fs.readFileSync('./cert/fullchain.pem')
}
*/
const ssl = false;
const PORT = process.env.PORT || 8080

app.enable('trust proxy')
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.get('/', authenticate, params, proxy)
spdy.createServer(ssl, app).listen(PORT, () => console.log(`Listening on ${PORT}`))
