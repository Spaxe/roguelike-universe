'use strict';

const fs = require('fs');
const r = require('rethinkdb');

r.connect({ host: 'localhost', port: 8005 })
.catch( err => {

  console.error(`
    Connection failed. Did you remember to establish ssh tunnel?

    runner start_tunnel_driver
  `);
  throw err;

}).then( connection => {

  r.dbDrop('test').run(connection)
  .then( () => {

    return r.dbCreate('universe').run(connection)

  }).catch( () => {} ).then( () => {

    connection.use('universe');

    return Promise.all([
      promise(populate, connection, 'roguelikes', '../data/roguelikes.json'),
      promise(populate, connection, 'games', '../data/games.json'),
      promise(populate, connection, 'corpus', '../data/corpus.json')
    ]).then( () => {
      connection.close();
    });

  }).catch( e => { console.error(e); });

});


const populate = function (connection, name, path, callback) {

  r.tableDrop(name).run(connection).catch( () => {} )
  .then( () => {
    return r.tableCreate(name).run(connection);
  })
  .then( () => {
    return promise(fs.readFile, path, 'utf-8')
  }).then(data => {
    const json = JSON.parse(data);
    return r.table(name).insert(json).run(connection).catch( e => {
      console.error(`Failed to insert ${name}.`);
      console.error(e);
    }).then( () => {
      if (typeof callback === 'function') callback();
    });
  });

};

const promise = ( func, ...args ) => {

  return new Promise( ( resolve, reject ) => {
    const callback = ( error, data ) => {
      if (error) reject(error);
      else resolve(data);
    };
    args.push(callback);
    func.apply(func, args);
  });

};