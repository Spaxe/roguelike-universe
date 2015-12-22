'use strict';

const r = require("rethinkdb");

r.connect( { host: 'localhost', port: 8005 }, function(err, conn) {
    if (err) {
      console.error(`Connection failed. Did you remember to establish ssh tunnel?

        runner tunnel_driver
      `);
      throw err;
    }
    console.log('Connection established.');
})