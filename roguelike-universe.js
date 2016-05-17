import d3 from 'd3';

const get_games = (cb) => {

  d3.json('data/games.json', data => {
    cb(data);
  });

};

const get_roguelikes = (cb) => {

  d3.json('data/roguelikes.json', data => {
    cb(data);
  });

};

const get_roguelike_relations = (cb) => {

  d3.json('data/roguelike-relations.json', data => {
    cb(data);
  });

};

const get_corpus = (cb) => {

  d3.json('data/corpus-relations.json', data => {
    cb(data);
  });

};

get_roguelikes(roguelikes => {

  d3.select('#roguelike-relations')
    .text(JSON.stringify(roguelikes));

});