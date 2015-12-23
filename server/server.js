'use strict';

const r = require('rethinkdb');
const express = require('express');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

const DB = 'universe';
const PORT = 8002;
const app = express();

app.param('version', (req, res, next, version) => {
  if (version === 'v1') next();
  else res.status(400).json({ reason: 'API version invalid. Try v1?' });
});

app.param('table', async ((req, res, next, table) => {

  try {
    const conn = await (connect());
    const cursor = await (r.db(DB).tableList().run(conn));
    var tables = await (cursor.toArray());
  } catch (e) {
    console.error('Connection failed: %s', err);
    res.status(500).json({ reason: 'Connection failed, sorry :(' });
  }

  if (tables.indexOf(table) > 0) next();
  else res.status(418).json({ reason: 'This is not the resource you are looking for' });
}));


app.get('/api/:version/:table', async ((req, res) => {

  try {
    const conn = await (connect());
    const cursor = await (r.db(DB).table('games').orderBy({ index: r.desc('Year')}).run(conn));
    const results = await (cursor.toArray());
    res.json(results);
  } catch (e) {
    console.error('Connection failed: %s', err);
    res.status(500).json({ reason: 'Connection failed, sorry :(' });
  }

}));

const connect = () => {

  return r.connect({ host: 'localhost', port: 8005 });

};

const server = app.listen(PORT, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('[%s] Started rogue-like-server at http://%s:%s', new Date(), 'localhost', port);
});