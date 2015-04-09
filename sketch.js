require(['node_modules/bvg/bvg'], function(BVG) {

  var game_sources_path = 'generated/game-sources.json';
  var game_relations_path = 'generated/roguelike-relations.json';
  var game_years_path = 'generated/games-years.json';
  var other_relations_path = 'generated/other-relations.json';

  var game_sources;
  var game_relations;
  var game_years;
  var other_relations;
  var year_bucket = {};

  // Layout
  var size = 100;
  var min_year;
  var max_year;
  var years;
  var barLength;

  // Program
  var universe = BVG.create('#universe', size);

  getJSON(game_years_path).then(function (json) {
    game_years = json;
    var ys = [];
    Object.keys(game_years).forEach(function (game) {
      ys.push(game_years[game]);
    });

    min_year = Math.min.apply(null, ys);
    max_year = Math.max.apply(null, ys);
    years = max_year - min_year + 1;
    barLength = (size - 10) / years;

    return getJSON(game_sources_path);

  }).then(function (json) {
    game_sources = json;

    // Sort games by year
    Object.keys(game_sources).forEach(function (title) {
      var year = game_sources[title]['Year'];
      if (!year_bucket[year]) year_bucket[year] = [];
      year_bucket[year].push(title);
    });

    // Draw timeline
    for (var y = min_year; y <= max_year; y++) {
      var x = (y - min_year) / years * (size - 10) + 5;
      if (year_bucket[y]) {
        var n = year_bucket[y].length;
        year_bucket[y].forEach(function (title, i) {
          // universe.rect(x,
          //               size / 2 - i,
          //               barLength * 0.9,
          //               0.8)
          //         .noStroke()
          //         .fill(100);
          game_sources[title].x = x + barLength * 0.9 / 2;
          game_sources[title].y = size / 2 - i + 0.4;
        });
      }
      universe.text(y, x, size / 2 + 1.75)
              .addClass('year');
    }

    return getJSON(game_relations_path);

  // Roguelike Relations
  }).then(function (json) {
    game_relations = json;

    Object.keys(game_relations).forEach(function (title) {
      var cache = {};
      game_relations[title].forEach(function (other) {
        if (cache.hasOwnProperty(other)) return;
        else cache[other] = true;

        var x = (game_sources[title].x + game_sources[other].x) / 2;
        var y = size / 2 + 0.5;
        var r = Math.abs(game_sources[title].x - game_sources[other].x) / 2;
        universe.arc(x, y, r, r, Math.PI, Math.PI*2)
                .stroke(0, 0, 0, 0.2)
                .strokeWidth(0.1)
                .noFill();
      });
    });

    return getJSON(other_relations_path);

  }).then (function (json) {
    other_relations = json;

    Object.keys(other_relations).forEach(function (title) {
      var cache = {};
      other_relations[title].forEach(function (other) {
        if (cache.hasOwnProperty(other)) return;
        else cache[other] = true;

        var title_x = (game_sources[title].Year - min_year) / years * (size - 10) + 5;
        var other_x = (game_years[other] - min_year) / years * (size - 10) + 5;
        var x = (title_x + other_x) / 2 + barLength * 0.9 / 2;
        var y = size / 2 + 2.5;
        var r = Math.abs(title_x - other_x) / 2;
        universe.arc(x, y, r, r, 0, Math.PI)
                .stroke(0, 0, 0, 0.05)
                .strokeWidth(0.1)
                .noFill();
      });
    });

  }).catch(function (e) {

    // Error handling
    throw e;
  });

  function getURL(url) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = function () {
        if (req.status == 200) {
          resolve(req.response);
        } else {
          reject(new Error(req.statusText));
        }
      };
      req.onerror = function() {
        reject(new Error('Network Error'));
      };
      req.send();
    });
  };

  function getJSON(url) {
    return getURL(url).then(JSON.parse).catch(function (err) {
      console.log('getJSON failed to load', url);
      throw err;
    });
  };

  // var universe = svg.g('translate(50 50) scale(0.5 0.5)');

  // // Load roguelike games and metadata
  // Promise.resolve(fn.getJSON(game_sources_path))
  //   .then(function (sources) {

  //     game_sources = sources;

  //     // Sort games by year
  //     fn.eachProp(sources, function (k, v) {
  //       var year = v['Year'];
  //       year_bucket[year] = year_bucket[year] ?
  //         year_bucket[year].concat([k]) : [k];
  //     });

  //     // Generate unit coordinates chronologically
  //     var i = 0;
  //     fn.eachProp(year_bucket, function (k, v) {
  //       fn.each(v, function (game) {
  //         sources[game].index = i;
  //         i++;
  //       });
  //     });

  //     // Load roguelike relations
  //     return Promise.resolve(fn.getJSON(game_relations_path));

  //   }).then(function (relations) {

  //     game_relations = relations;

  //     // Draw game titles
  //     var lines = universe.g('translate(0 800)');
  //     fn.eachProp(game_sources, function (k, v) {
  //       lines.rect(v.index * (unit * 1.5), 0, unit, unit/4)
  //     });

      // var lines = universe.group()
      //                     .transform({x: 0, y: 800});
      // fn.eachProp(game_sources, function (k, v) {
      //   lines.rect(unit, unit/4)
      //        .transform({
      //          x: v.index * (unit * 1.5),
      //          y: 0
      //        });
      //   lines.text(k)
      //        .transform({
      //          x: v.index * (unit * 1.5) + unit,
      //          y: -unit * 2,
      //          cx: v.index * (unit * 1.5),
      //          cy: 0,
      //          rotation: 90
      //        })
      //        .addClass('roguelike-title')
      //        .data('title', k)
      //        .on('mouseover', title_mousehover)
      //        .on('mouseout', title_mouseout);
      // });

  // var group_relations = universe.group().transform({x: 0, y: 800})


  //   }).then(function (relations) {

  //     game_relations = relations;

  //     // Remove loading placeholder
  //     document.getElementById('loading').remove();

  //     // Draw game titles
  //     var lines = universe.group()
  //                         .transform({x: 0, y: 800});
  //     fn.eachProp(game_sources, function (k, v) {
  //       lines.rect(unit, unit/4)
  //            .transform({
  //              x: v.index * (unit * 1.5),
  //              y: 0
  //            });
  //       lines.text(k)
  //            .transform({
  //              x: v.index * (unit * 1.5) + unit,
  //              y: -unit * 2,
  //              cx: v.index * (unit * 1.5),
  //              cy: 0,
  //              rotation: 90
  //            })
  //            .addClass('roguelike-title')
  //            .data('title', k)
  //            .on('mouseover', title_mousehover)
  //            .on('mouseout', title_mouseout);
  //     });

  //     // Draw connections
  //     fn.eachProp(game_relations, function (k, v) {
  //       fn.each(fn.unique(v), function (r) {
  //         if (k !== r) {
  //           var k_index = game_sources[k].index;
  //           var r_index = game_sources[r].index;
  //           var kx = k_index * (unit * 1.5);
  //           var rx = r_index * (unit * 1.5);
  //           var d = Math.abs(kx - rx);
  //           var arc = fn.arc((kx+rx)/2+unit/2, 0, d/2, Math.PI, Math.PI*2);
  //           group_relations.path(arc)
  //                          .data('titles', [k, r])
  //                          .addClass('roguelike-relation');
  //         }
  //       });
  //     });
  //   });

  //   // Interactions
  //   function title_mousehover () {
  //     this.addClass('roguelike-title-hover');
  //     var title = this.data('title');
  //     group_relations.each(function () {
  //       if (fn.has(this.data('titles'), title)) {
  //         this.addClass('roguelike-relation-hover');
  //       }
  //     });
  //   }

  //   function title_mouseout () {
  //     this.removeClass('roguelike-title-hover');
  //     group_relations.each(function () {
  //       this.removeClass('roguelike-relation-hover');
  //     });
  //   }
});