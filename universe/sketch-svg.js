;document.addEventListener('DOMContentLoaded', function () {
  // Data
  var game_relations;
  var year_bucket;

  // Layout
  var padding = 50;
  var w = 1600;
  var h = 1000;
  var division = 800;

  // Element
  var unit = 12;

  // Program
  fn.svg('universe').then(function (svg) {
    return Promise.all(fn.getJSON([
      'generated/game-sources.json',
      'generated/roguelike-relations.json'
    ]));
  }).then(function (data) {
    console.log(data);
  });

});