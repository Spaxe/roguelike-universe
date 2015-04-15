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
  var force_graph = [];

  // Layout
  var samples_height = 20;
  var samples_width = 100;
  var heinlein_height = 80;
  var heinlein_width = 100;
  var force_width = 100;
  var force_height = 100;
  var min_year;
  var max_year;
  var years;
  var barLength;

  // Charts
  var sampled_games = BVG.create('#samples', samples_width, samples_height);
  var heinlein = BVG.create('#heinlein', heinlein_width, heinlein_height);
  var force_layout = BVG.create('#force', force_width, force_height);

  getJSON(game_years_path).then(function (json) {
    game_years = json;
    var ys = [];
    Object.keys(game_years).forEach(function (game) {
      ys.push(game_years[game]);
    });

    min_year = Math.min.apply(null, ys);
    max_year = Math.max.apply(null, ys);
    years = max_year - min_year + 1;
    barLength = (heinlein_width - 10) / years;

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
      var x = (y - min_year) / years * (heinlein_width - 10) + 5;
      if (year_bucket[y]) {
        var n = year_bucket[y].length;
        year_bucket[y].forEach(function (title, i) {
          // Stacked chart for sampled games
          sampled_games.rect(x,
                             samples_height * 0.75 - i,
                             barLength * 0.9,
                             0.8)
                       .noStroke()
                       .fill(BVG.hsla(getHueByYear(y), 40, 60));

          // Beginning force layout coordinates
          game_sources[title].x = Math.random() * 60 + 20;
          game_sources[title].y = Math.random() * 60 + 20;
        });
      }

      // Timeline for Stacked Chart
      sampled_games.text(y, x, samples_height * 0.75 + 1.75)
              .addClass('year')
              .fill(BVG.hsla(getHueByYear(y), 40, 60));

      // Timeline for Heinlein
      heinlein.text(y, x, heinlein_height / 2 + 1.75)
              .addClass('year')
              .fill(BVG.hsla(getHueByYear(y), 40, 60));
    }

    return getJSON(game_relations_path);

  // Roguelike Relations
  }).then(function (json) {
    game_relations = json;

    Object.keys(game_relations).forEach(function (title) {
      var cache = {};

      heinlein.text('Roguelike games', 5, 10)
              .addClass('label')
              .fill(BVG.hsla(20, 30, 70));

      game_relations[title].forEach(function (other) {
        if (cache.hasOwnProperty(other) || other === title) return;
        else cache[other] = true;

        // Draw relation Heinlein arcs
        var title_x = (game_sources[title].Year - min_year) / years * (heinlein_width - 10) + 5;
        var other_x = (game_sources[other].Year - min_year) / years * (heinlein_width - 10) + 5;
        var x = (title_x + other_x) / 2;
        var y = heinlein_height / 2 + 0.5;
        var r = Math.abs(title_x - other_x) / 2;
        heinlein.arc(x, y, r, r, Math.PI, Math.PI*2)
                .stroke(BVG.hsla(getHueByYear(game_sources[title].Year), 40, 70))
                .strokeWidth(0.1)
                .noFill();

        // Draw force layout links
        var line = new BVG('line', {
          begin: game_sources[title],
          end: game_sources[other]
        }, function (tag, data) {
          tag.setAttribute('x1', data.begin.x);
          tag.setAttribute('y1', data.begin.y);
          tag.setAttribute('x2', data.end.x);
          tag.setAttribute('y2', data.end.y);
        });
        line.strokeWidth(0.1);
        force_layout.append(line);
      });
    });


    //Draw Force directed layout nodes
    Object.keys(game_sources).forEach(function (title) {
      var circle = new BVG('circle', {
          points: game_sources[title],
          r: 0.5
        }, function (tag, data) {
          tag.setAttribute('cx', data.points.x);
          tag.setAttribute('cy', data.points.y);
          tag.setAttribute('r', data.r);
        });
        circle.strokeWidth(0.1)
              .stroke(240, 128, 64)
              .fill(220, 64, 32);
        force_layout.append(circle);
    });

    // Update Force Layouts
    // var forceLayoutIntervalID = window.setInterval(function () {
    //   console.log('force layout updating');
    //   if (updateForceLayout(game_sources, game_relations)) {
    //     window.clearInterval(forceLayoutIntervalID);
    //     console.log('force layout converged');
    //   }
    // }, 500);

    function _updateForceLayout () {
      if(!updateForceLayout(game_sources, game_relations)) {
        window.requestAnimationFrame(_updateForceLayout);
      } else {
        console.log('Force Layout completed');
      }
    }
    window.requestAnimationFrame(_updateForceLayout);

    // force_layout.tag().addEventListener('click', function () {
      // for (var i = 0; i < 100; i++) {
      //   console.log(i);
        // updateForceLayout(game_sources, game_relations);
      // }
    // });

    return getJSON(other_relations_path);

  }).then (function (json) {
    other_relations = json;

    Object.keys(other_relations).forEach(function (title) {
      var cache = {};

      heinlein.text('Other games', 5, 75)
              .addClass('label')
              .fill(BVG.hsla(20, 30, 80));

      other_relations[title].forEach(function (other) {
        if (cache.hasOwnProperty(other)) return;
        else cache[other] = true;

        var title_x = (game_sources[title].Year - min_year) / years * (heinlein_width - 10) + 5;
        var other_x = (game_years[other] - min_year) / years * (heinlein_width - 10) + 5;
        var x = (title_x + other_x) / 2 + barLength * 0.9 / 2;
        var y = heinlein_height / 2 + 2.5;
        var r = Math.abs(title_x - other_x) / 2;
        heinlein.arc(x, y, r, r, 0, Math.PI)
                .stroke(BVG.hsla(getHueByYear(game_sources[title].Year), 40, 70, 0.2))
                .strokeWidth(0.1)
                .noFill();
      });
    });

  }).catch(function (e) {

    // Error handling
    throw e;
  });

  function getURL (url) {
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

  function getJSON (url) {
    return getURL(url).then(JSON.parse).catch(function (err) {
      console.log('getJSON failed to load', url);
      throw err;
    });
  };

  function getHueByYear (year) {
    return (year - min_year) / (max_year - min_year) * 360;
  }

  function updateForceLayout (points, relations, attraction, threshold, repulsion) {
    attraction = attraction || 3;
    threshold = threshold || 5;
    repulsion = repulsion || 8;

    // Converging variable
    var limit = 0.1;
    var converge = limit;

    // Reset forces
    var forces = {}
    Object.keys(points).forEach(function (point) {
      forces[point] = {
        Fx: 0,
        Fy: 0
      };
    });

    // Calculate attractive forces and repulsive forces
    Object.keys(points).forEach(function (point) {
      Object.keys(points).forEach(function (other) {
        if (point === other) return;
        var xDistance = points[other].x - points[point].x;
        var yDistance = points[other].y - points[point].y;
        var angle = Math.atan2(yDistance, xDistance);
        var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

        if (relations[point].indexOf(other) > -1 || relations[other].indexOf(point) > -1) {
          var F = attraction * Math.log(distance / threshold);
        } else {
          var F = Math.log(distance / (threshold * repulsion));
        }

        var Fx = F * Math.cos(angle);
        var Fy = F * Math.sin(angle);
        forces[point].Fx += Fx;
        forces[point].Fy += Fy;
        forces[other].Fx += -Fx;
        forces[other].Fy += -Fy;

        converge = Math.max(converge, Math.abs(Fx), Math.abs(Fy));
      });
    });

    // Move a tiny step
    Object.keys(points).forEach(function (point) {
      points[point].x += forces[point].Fx * 0.1;
      points[point].y += forces[point].Fy * 0.1;
    });

    // Establish convergence
    return converge <= limit;
  }

});