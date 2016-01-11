'use strict';

const fs = require('fs');
const r = require('rethinkdb');
const morgan = require('morgan');
const express = require('express');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

const accessLogPath = __dirname + '/access.log';
const accessLogStream = fs.createWriteStream(accessLogPath, {flags: 'a'});

const DB = 'universe';
const PORT = 8002;

const connect = async (() => {
  // Attempt local (development) then remote tunnel (production)
  try {
    return await (r.connect({ host: 'localhost', port: 8005 }));
  } catch (e) {
    try {
      return await (r.connect({ host: 'database', port: 28015 }));

    } catch (e) {
      throw e;
    }
  }
});


const failed = (req, res, e) => {
  console.error('Connection failed: %s', e);
  accessLogStream.write(`Connection failed: ${e.toString()}\n`);
  res.status(500).json({ reason: 'Connection failed, sorry :(' });
};

////////////////////////////////////////////////////////////////////////
// User input validations
const validateVersion = (req, res, next, version) => {
  if (version === 'v1') next();
  else res.status(400).json({ reason: 'API version not supported. Try v1' });
};

const validateTable = async ((req, res, next, table) => {
  if (cache.tables.length === 0) {
    try {
      const conn = await (connect());
      const cursor = await (r.db(DB).tableList().run(conn));
      cache.tables = await (cursor.toArray());
    } catch (e) {
      failed(req, res, e);
    }
  }

  if (cache.tables.indexOf(table) > 0) next();
  else res.status(418).json({ reason: 'This is not the resource you are looking for' });
});

const getTable = async ((req, res) => {
  try {
    const conn = await (connect());
    const count = await (r.db(DB).table(req.params.table).count().run(conn));
    const sample = await (r.db(DB).table(req.params.table).sample(1).run(conn));

    res.json({
      count: count,
      sample: await (sample.toArray()),
    });
  } catch (e) {
    failed(req, res, e);
  }
});

const getGame = async ( (req, res) => {
  try {
    const conn = await (connect());
    const game = await (r.db(DB)
      .table('games')
      .getAll(req.params.title, {index: 'title'})
      .without('id')
      .run(conn));
    res.json( await (game.toArray()) );
  } catch (e) {
    failed(req, res, e);
  }
});

const getRoguelike = async ( (req, res) => {
  try {
    const conn = await (connect());
    const game = await (r.db(DB)
      .table('roguelikes')
      .getAll(req.params.title, {index: 'title'})
      .without('id')
      .run(conn));
    res.json( await (game.toArray()) );
  } catch (e) {
    failed(req, res, e);
  }
});

const getRoguelikeList = async ( (req, res) => {
  try {
    const conn = await (connect());
    const gameList = await (r.db(DB)
      .table('roguelikes')
      .without('id')
      .orderBy('year')
      .run(conn));
    res.json( await (gameList.toArray()) );
  } catch (e) {
    failed(req, res, e);
  }
});

const _getRoguelikeRlations = async ( (conn, title) => {
  const year = await( await (r.db(DB)
    .table('roguelikes')
    .getAll(title, {index: 'title'})
    .getField('year')
    .run(conn)).toArray())[0];

  if (!year) {
    res.status(404).json({reason: 'That game does not exist in our records.'});
    return;
  }

  const relationA = flatten(await( await (r.db(DB)
    .table('roguelike_relations')
    .getAll(title, {index: 'title'})
    .getField('relations')
    .run(conn)).toArray()));
  const relationB = await( await (r.db(DB)
    .table('roguelike_relations')
    .getAll(title, {index: 'relations'})
    .getField('title')
    .run(conn)).toArray());

  const relations = relationA.concat(relationB).filter(unique);

  let inspiredBy = [],
      inspirationTo = [];

  relations.forEach( title => {
    const thisYear = await( await (r.db(DB)
      .table('roguelikes')
      .getAll(title, {index: 'title'})
      .getField('year')
      .run(conn)).toArray())[0];

    if (!thisYear) console.warn(title, "doesn't have a year recorded.");

    if (thisYear < year) {
      inspiredBy.push({title, year: thisYear});
    } else if (thisYear > year) {
      inspirationTo.push({title, year: thisYear});
    } else {
      // Same year, unsure
    }
  });

  return { title, year, inspiredBy, inspirationTo };
});

const getRoguelikeRelations = async ((req, res) => {
  try {
    const conn = await (connect());
    res.json(await (_getRoguelikeRlations(conn, req.params.title)));
  } catch (e) {
    failed(req, res, e);
  }
});

const getRoguelikeRelationsAll = async ((req, res) => {
  try {
    const conn = await (connect());
    const titles = await( await (r.db(DB)
      .table('roguelikes')
      .getField('title')
      .run(conn)).toArray());
    const relations = titles.map( async ((title) => {
      return await (_getRoguelikeRlations(conn, title));
    }));
    res.json(await (relations));
  } catch (e) {
    failed(req, res, e);
  }
});

const getRoguelikeWords = async ((req, res) => {
  try {
    const conn = await (connect());
    const title = req.params.title;
    const words = await( await (r.db(DB)
        .table('corpus')
        .getAll(title, {index: 'game'})
        .pluck('content', 'url')
        .run(conn)).toArray());
    res.json( {title, words} );
  } catch (e) {
    failed(req, res, e);
  }
});

////////////////////////////////////////////////////////////////////////
// Server entry point
const app = express();

let cache = {
  tables: []
};

app.use(morgan('combined', {stream: accessLogStream}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.param('version', validateVersion);
app.param('table', validateTable);

app.get('/api/:version/table/:table', getTable);
app.get('/api/:version/game/title/:title', getGame);
app.get('/api/:version/roguelike/title/:title', getRoguelike);
app.get('/api/:version/roguelike/list', getRoguelikeList);
app.get('/api/:version/roguelike/relations/:title', getRoguelikeRelations);
app.get('/api/:version/roguelike/relations-all', getRoguelikeRelationsAll);
app.get('/api/:version/roguelike/words/:title', getRoguelikeWords);

// catch 404 and forward to error handler
app.use( (req, res, next) => {
  res.status(404).json({ reason: 'Nothing here.' });
});

const server = app.listen(PORT, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('[%s] Started rogue-like-server at http://%s:%s', new Date(), 'localhost', port);
});

// Utility
const unique = (value, index, self) => {
  return self.indexOf(value) === index;
};

const flatten = arrays => {
  return [].concat.apply([], arrays);
};