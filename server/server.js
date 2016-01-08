'use strict';

const r = require('rethinkdb');
const express = require('express');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

const DB = 'universe';
const PORT = 8002;
const app = express();

let cache = {
  tables: []
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.param('version', (req, res, next, version) => {
  if (version === 'v1') next();
  else res.status(400).json({ reason: 'API version invalid. Try v1?' });
});

app.param('table', async ((req, res, next, table) => {

  if (cache.tables.length === 0) {
    try {
      const conn = await (connect());
      const cursor = await (r.db(DB).tableList().run(conn));
      cache.tables = await (cursor.toArray());
    } catch (e) {
      console.error('Connection failed: %s', e);
      res.status(500).json({ reason: 'Connection failed, sorry :(' });
    }
  }

  if (cache.tables.indexOf(table) > 0) next();
  else res.status(418).json({ reason: 'This is not the resource you are looking for' });
}));

app.get('/api/:version/table/:table', async ((req, res) => {

  console.log(req);
  try {
    const conn = await (connect());
    const count = await (r.db(DB).table(req.params.table).count().run(conn));
    const sample = await (r.db(DB).table(req.params.table).sample(1).run(conn));

    res.json({
      count: count,
      sample: await (sample.toArray()),
    });
  } catch (e) {
    console.error('Connection failed: %s', e);
    res.status(500).json({ reason: 'Connection failed, sorry :(' });
  }

}));

// catch 404 and forward to error handler
app.use( (req, res, next) => {
  res.status(404).json({ reason: 'Nothing here.' });
});


const connect = () => {

  return r.connect({ host: 'localhost', port: 8005 });

};

const server = app.listen(PORT, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('[%s] Started rogue-like-server at http://%s:%s', new Date(), 'localhost', port);
});