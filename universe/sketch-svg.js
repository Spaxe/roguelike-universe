document.addEventListener('DOMContentLoaded', function () {

  var game_sources_path = 'generated/game-sources.json';
  var game_relations_path = 'generated/roguelike-relations.json';

  var game_sources;
  var game_relations;
  var year_bucket = {};

  // Layout
  var padding = 50;
  var w = 1600;
  var h = 1000;
  var division = 800;

  // Element
  var unit = 12;

  // Program
  var svg = fn.svg('universe')
              .fixSubPixelOffset();
  var universe = svg.group().transform({
    x: padding,
    y: padding,
    scaleX: 0.5,
    scaleY: 0.5
  });

  // Load roguelike games and metadata
  Promise.resolve(fn.getJSON(game_sources_path))
    .then(function (sources) {

      // Sort games by year
      fn.eachProp(sources, function (k, v) {
        var year = v['Year'];
        year_bucket[year] = year_bucket[year] ?
          year_bucket[year].concat([k]) : [k];
      });

      // Generate unit coordinates chronologically
      var i = 0;
      fn.eachProp(year_bucket, function (k, v) {
        fn.each(v, function (game) {
          sources[game].index = i;
          i++;
        });
      });

      game_sources = sources;

      // Load roguelike relations
      return Promise.resolve(fn.getJSON(game_relations_path));
    }).then(function (relations) {

      var lines = universe.group()
                          .transform({x: 0, y: 800});
      fn.eachProp(game_sources, function (k, v) {
        lines.rect(unit, unit/3).transform({x: v.index * (unit * 1.5), y: 0});
      });

    });

});