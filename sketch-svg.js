/* globals fn */
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
  var svg = fn.svg('universe');
  var universe = svg.group().transform({
    x: padding,
    y: padding,
    scaleX: 0.5,
    scaleY: 0.5
  });
  var group_relations = universe.group().transform({x: 0, y: 800})

  // Load roguelike games and metadata
  Promise.resolve(fn.getJSON(game_sources_path))
    .then(function (sources) {

      game_sources = sources;

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

      // Load roguelike relations
      return Promise.resolve(fn.getJSON(game_relations_path));
    }).then(function (relations) {

      game_relations = relations;

      // Remove loading placeholder
      document.getElementById('loading').remove();

      // Draw game titles
      var lines = universe.group()
                          .transform({x: 0, y: 800});
      fn.eachProp(game_sources, function (k, v) {
        lines.rect(unit, unit/4)
             .transform({
               x: v.index * (unit * 1.5),
               y: 0
             });
        lines.text(k)
             .transform({
               x: v.index * (unit * 1.5) + unit,
               y: -unit * 2,
               cx: v.index * (unit * 1.5),
               cy: 0,
               rotation: 90
             })
             .addClass('roguelike-title')
             .data('title', k)
             .on('mouseover', title_mousehover)
             .on('mouseout', title_mouseout);
      });

      // Draw connections
      fn.eachProp(game_relations, function (k, v) {
        fn.each(fn.unique(v), function (r) {
          if (k !== r) {
            var k_index = game_sources[k].index;
            var r_index = game_sources[r].index;
            var kx = k_index * (unit * 1.5);
            var rx = r_index * (unit * 1.5);
            var d = Math.abs(kx - rx);
            var arc = fn.arc((kx+rx)/2+unit/2, 0, d/2, Math.PI, Math.PI*2);
            group_relations.path(arc)
                           .data('titles', [k, r])
                           .addClass('roguelike-relation');
          }
        });
      });
    });

    // Interactions
    function title_mousehover () {
      this.addClass('roguelike-title-hover');
      var title = this.data('title');
      group_relations.each(function () {
        if (fn.has(this.data('titles'), title)) {
          this.addClass('roguelike-relation-hover');
        }
      });
    }

    function title_mouseout () {
      this.removeClass('roguelike-title-hover');
      group_relations.each(function () {
        this.removeClass('roguelike-relation-hover');
      });
    }

});