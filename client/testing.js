'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const req = require("requisition");
const glossary = require("glossary")({
  frequency: 2,
  collapse: true
});
const server_url = 'http://188.166.209.155/api/v1';

const corpus_for = async (function (title) {
    const url = `${server_url}/roguelike/words/${title}`;
    const res = await (req(url));
    return await (res.json());
});

corpus_for('Rogue').then( corpus => {
  let whole_corpus = [];
  corpus.words.forEach( words => {
      whole_corpus.push(words.content);
  });
  let words = whole_corpus.join("\n");

  let output = glossary.extract(words);

  console.log(output);
});

