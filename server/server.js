'use strict';

const express = require('express');

const PORT = 8002;

const app = express();
app.get('/', function (req, res) {
  res.send('Mrraa\n');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
