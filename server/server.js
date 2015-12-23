'use strict';

const r = require('rethinkdb');
const express = require('express');

const DB = 'universe';
const PORT = 8002;

const app = express();

app.get('/v1/games', (req, res) => {

  connect().then( conn => {

    return r.db(DB).table('games').orderBy({ index: r.desc('Year')}).run(conn);

  }).then( cursor => {

    cursor.toArray().then( results => {
      res.json(results);
    });

  }).catch( err => {

    console.error('Connection failed: %s', err);
    res.status(500).json({ reason: 'Connection failed, sorry :(' });

  });

});

const connect = () => {

  return r.connect({ host: 'localhost', port: 8005 });

};













const server = app.listen(PORT, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('[%s] Started rogue-like-server at http://%s:%s', new Date(), 'localhost', port);
});