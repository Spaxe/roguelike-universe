'use strict';

const express = require('express');

// Constants
const PORT = 8002;

// App
const app = express();
app.get('/', function (req, res) {
  res.send('Mrraa\n');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
