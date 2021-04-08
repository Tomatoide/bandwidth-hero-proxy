#!/usr/bin/env node
'use strict'
const app = require('express')()
const authenticate = require('./src/authenticate')
const params = require('./src/params')
const proxy = require('./src/proxy')
const spdy = require('spdy')
const fs = require('fs')

var options = {

  // **optional** SPDY-specific options
  spdy: {
    protocols: [ 'h2', 'spdy/3.1', 'http/1.1' ],
    // ssl doesn't make sense when we have ssl termination.
    // key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
    // Fullchain file or cert file (prefer the former)
    // cert: fs.readFileSync(__dirname + '/keys/spdy-fullchain.pem'),
    ssl: false,
    plain: true,

    // **optional**
    // Parse first incoming X_FORWARDED_FOR frame and put it to the
    // headers of every request.
    // NOTE: Use with care! This should not be used without some proxy that
    // will *always* send X_FORWARDED_FOR
    'x-forwarded-for': true,

    connection: {
      windowSize: 1024 * 1024, // Server's window size

      // **optional** if true - server will send 3.1 frames on 3.0 *plain* spdy
      autoSpdy31: true
    }
  }
};
const PORT = process.env.PORT || 8080

app.enable('trust proxy')
app.get('/', authenticate, params, proxy)
app.get('/favicon.ico', (req, res) => res.status(204).end())
spdy.createServer(options, app).listen(PORT, () => console.log(`Listening on ${PORT}`))
//app.listen(PORT, () => console.log(`Listening on ${PORT}`))
