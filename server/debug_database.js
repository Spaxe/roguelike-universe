const r = require('rethinkdb');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

let c = await (r.connect({host: 'dockerhost', port: 28015}));