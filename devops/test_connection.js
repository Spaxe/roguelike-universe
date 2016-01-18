'use strict';

const r = require('rethinkdb');

r.connect({ host: 'localhost', port: 8005 })
  .then( connection => {

    console.log('Connection successful!');
    connection.close();

  }).catch( err => {

    console.error(`Connection failed. Did you remember to establish ssh tunnel?

      runner start_tunnel_driver
    `);
    throw err;

  });

