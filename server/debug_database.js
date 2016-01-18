'use strict';

const r = require('rethinkdb');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

let c = await (r.connect({host: 'database', port: 28015}));