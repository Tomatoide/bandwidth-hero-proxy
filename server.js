#!/usr/bin/env node
'use strict';
const cluster = require('cluster');
const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < WORKERS; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork()
    });

    throng({
      workers: WORKERS,
      lifetime: Infinity
    }, start);
} else {
    const PORT = process.env.PORT || 8080;
    const app = require('express')();
    const authenticate = require('./src/authenticate');
    const params = require('./src/params');
    const proxy = require('./src/proxy');
    const spdy = require('spdy');
    const fs = require('fs');


    // Turn on SSL if possible, but run http2c if not.
    // http2c makes if SSL is offloaded.
    const keyPath = './cert/privkey.pem';
    const certPath = './cert/fullchain.pem';
    let ssl = false;
    let plain = true;
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        ssl = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
        plain = false;
    }

    const options = {

        // **optional** SPDY-specific options
        spdy: {
            protocols: ['h2', 'spdy/3.1', 'http/1.1'],
            ssl: ssl,
            plain: plain,
            connection: {
                windowSize: 1024 * 1024, // Server's window size
                // **optional** if true - server will send 3.1 frames on 3.0 *plain* spdy
                // helpful for best performance behind SSL offload.
                autoSpdy31: true
            }
        }
    };

    app.enable('trust proxy');
    app.get('/favicon.ico', (req, res) => res.status(204).end());
    app.get('/', authenticate, params, proxy);
    spdy.createServer(options, app).listen(PORT, () => console.log(`Listening on ${PORT}`));
}
