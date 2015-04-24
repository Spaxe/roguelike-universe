/* globals require */
require(['node_modules/bvg/bvg'], function(BVG) {

  // Paths
  var path_gameSources = 'generated/game-sources.json';
  var path_gameRelations = 'generated/roguelike-relations.json';
  var path_gameYears = 'generated/games-years.json';
  var path_otherRelations = 'generated/other-relations.json';

  // Containers
  var data_gameSources;
  var data_gameRelations;
  var data_gameYears;
  var data_otherRelations;

  // Layout
  var heinlein_height = 80;
  var force_height = 100;

  // Dynamic Functions
  var getXCoordByYear;
  var getHueByYear;
  var getYearWidth;

  // Charts
  var BVG_Heinlein = BVG.create('#heinlein', 100, heinlein_height);
  var BVG_Force = BVG.create('#force', 100, force_height);

  // Controls
  var UI_GameSelection = document.querySelector('#game-selection');

  // Async request for the list of game and years
  getJSON(path_gameYears).then(function (json) {
    data_gameYears = json;
    var ys = [];
    Object.keys(data_gameYears).forEach(function (game) {
      ys.push(data_gameYears[game]);
    });

    var min_year = Math.min.apply(null, ys);
    var max_year = Math.max.apply(null, ys);
    getYearWidth = function () {
      return 90 / (max_year - min_year + 1);
    };
    getXCoordByYear = function (year) {
      return (year - min_year) / (max_year - min_year + 1) * 90 + 5;
    };
    getHueByYear = function (year) {
      return (year - min_year) / (max_year - min_year) * 360;
    };

    for (var year = min_year; year <= max_year; year++) {
      var x = getXCoordByYear(year);
      BVG_Heinlein.text(year, x, heinlein_height / 2 + 1.75)
                  .addClass('year')
                  .fill(BVG.hsla(getHueByYear(year), 40, 60));
    }
    return getJSON(path_gameSources);

  }).then(function (json) {
    data_gameSources = json;

    // Scramble force layout coordinates and populate titles
    Object.keys(data_gameSources).sort().forEach(function (title) {
      var option = document.createElement('option');
      option.value = title;
      option.innerHTML = title;
      UI_GameSelection.appendChild(option);
      data_gameSources[title].x = Math.random() * 100;
      data_gameSources[title].y = Math.random() * 100;
    });

    return getJSON(path_gameRelations);

  // Roguelike Relations
  }).then(function (json) {
    data_gameRelations = json;

    Object.keys(data_gameRelations).forEach(function (title) {
      var cache = {};

      BVG_Heinlein.text('Roguelike games', 5, 10)
                  .addClass('heinlein-label')
                  .fill(BVG.hsla(20, 30, 70));
      var title_year = data_gameSources[title].Year;

      data_gameRelations[title].forEach(function (other) {
        if (cache.hasOwnProperty(other) || other === title) return;
        else cache[other] = true;

        // Inspiration must come from the past, not future
        var other_year = data_gameSources[other].Year;
        var source = other_year <= title_year ? other : title;
        var target = other_year > title_year ? other : title;

        // Draw Roguelike relation Heinlein arcs
        var target_x = getXCoordByYear(data_gameSources[target].Year);
        var source_x = getXCoordByYear(data_gameSources[source].Year);
        var x = (target_x + source_x) / 2 + getYearWidth() * 0.9 / 2;
        var y = heinlein_height / 2 + 0.5;
        var r = Math.abs(target_x - source_x) / 2;
        var c = BVG.hsla(getHueByYear(data_gameSources[target].Year), 40, 70);
        BVG_Heinlein.arc(x, y, r, r, Math.PI, Math.PI*2)
                    .stroke(c)
                    .strokeWidth(0.1)
                    .noFill()
                    .data('source', source)
                    .data('target', target)
                    .data('colour', c)
                    .addClass('arc');

        // Draw force layout links
        var link = arrow({
          begin: data_gameSources[source],
          end: data_gameSources[target],
          r: 0.1,
          offset: 1
        });
        link.line.strokeWidth(0.1);
        link.line.stroke(c);
        link.endpoint.stroke(c);
        BVG_Force.append(link.line);
        BVG_Force.append(link.endpoint);
      });
    });

    //Draw Force directed layout nodes
    Object.keys(data_gameSources).forEach(function (title) {
      var colour = BVG.hsla(getHueByYear(data_gameSources[title].Year), 40, 60);

      var circle = new BVG('circle', {
          point: data_gameSources[title],
          r: 0.5
      }, function (tag, data) {
        tag.setAttribute('cx', data.point.x);
        tag.setAttribute('cy', data.point.y);
        tag.setAttribute('r', data.r);
      });
      circle.strokeWidth(0.1)
            .noStroke()
            .fill(colour)
            .data('title', title)
            .addClass('influence-node');
      BVG_Force.append(circle);

      // Label
      var label = new BVG('text', {
        point: data_gameSources[title],
        title: title
      }, function (tag, data) {
        var x = data.point.x - tag.getBBox().width / 2;
        var y = data.point.y - 1;
        tag.setAttribute('x', x);
        tag.setAttribute('y', y);
        tag.innerHTML = data.title;
      }).addClass('influence-label')
        .noStroke()
        .fill(colour);
      BVG_Force.append(label);
    });

    // Allow mouse interactions
    var forceMouseTarget = '';
    var forceElement = BVG_Force.tag();
    forceElement.addEventListener('mousedown', function (event) {
      if (event.target.tagName && event.target.tagName === 'circle') {
        forceMouseTarget = event.target._getBVG().data('title');
        console.log(forceMouseTarget);
        data_gameSources[forceMouseTarget].dragging = true;
        BVG_Force.addClass('noselect');
      }
    });
    forceElement.addEventListener('mouseup', function (event) {
      if (forceMouseTarget) {
        data_gameSources[forceMouseTarget].dragging = false;
        forceMouseTarget = '';
        BVG_Force.removeClass('noselect');
      }
    });
    forceElement.addEventListener('mousemove', function (event) {
      if (forceMouseTarget) {
        var bvgWidth = forceElement.offsetWidth;
        var bvgHeight = forceElement.offsetHeight;
        if (bvgWidth !== 0 && bvgHeight !== 0) {
          // var x = event.offsetX / bvgWidth * 100;
          // var y = event.offsetY / bvgHeight * force_height;
          // console.log(event.offsetX, event.offsetY, bvgWidth, bvgHeight, event);
          var dx = event.movementX / bvgWidth * 100;
          var dy = event.movementY / bvgHeight * force_height;
          // data_gameSources[forceMouseTarget].x = x;
          // data_gameSources[forceMouseTarget].y = y;
          data_gameSources[forceMouseTarget].x += dx;
          data_gameSources[forceMouseTarget].y += dy;
        }
      }
    });

    function _forceElementDragHandler () {

    }

    function _updateForceLayout () {
      if(!updateForceLayout(data_gameSources, data_gameRelations)) {
        window.requestAnimationFrame(_updateForceLayout);
      } else {
        console.log('Force Layout completed');
      }
    }
    window.requestAnimationFrame(_updateForceLayout);

    return getJSON(path_otherRelations);

  }).then(function (json) {
    data_otherRelations = json;

    Object.keys(data_otherRelations).forEach(function (title) {
      var cache = {};

      BVG_Heinlein.text('Other games', 5, 75)
              .addClass('heinlein-label')
              .fill(BVG.hsla(20, 30, 80));

      // Heinlein relations for out of genre
      data_otherRelations[title].forEach(function (other) {
        if (cache.hasOwnProperty(other)) return;
        else cache[other] = true;

        var title_x = getXCoordByYear(data_gameSources[title].Year);
        var other_x = getXCoordByYear(data_gameYears[other]);
        var x = (title_x + other_x) / 2 + getYearWidth() * 0.9 / 2;
        var y = heinlein_height / 2 + 2.5;
        var r = Math.abs(title_x - other_x) / 2;
        var c = BVG.hsla(getHueByYear(data_gameSources[title].Year), 40, 70, 0.2);
        BVG_Heinlein.arc(x, y, r, r, 0, Math.PI)
                .stroke(c)
                .strokeWidth(0.1)
                .noFill()
                .data('source', other)
                .data('target', title)
                .data('colour', c)
                .addClass('arc');
      });
    });

    ///////
    // UI Handling
    // Attach update function to game selection
    UI_GameSelection.addEventListener('change', function gameSelectionFunc (event) {
      var game = data_gameSources[event.target.value];

      // Clean up existing selection
      BVG_Heinlein.find('.heinlein-selection').forEach(function (bvg) {
        bvg.remove();
      });
      BVG_Heinlein.find('.arc').forEach(function (bvg) {
        bvg.removeClass('heinlein-selection-arc');
        bvg.stroke(bvg.data('colour'));
      });

      // Draw selected game label
      drawGameLabel(event.target.value, getXCoordByYear(game.Year));

      // Bold selected relations
      BVG_Heinlein.find('.arc').forEach(function (bvg) {
        if (bvg.data('source') === event.target.value || bvg.data('target') === event.target.value) {
          bvg.addClass('heinlein-selection-arc');
          var c = bvg.stroke();
          c[0] = getHueByYear(data_gameSources[event.target.value].Year);
          bvg.stroke(BVG.hsla.apply(BVG, c));
        }
      });
    });

  // Error handling
  }).catch(function (e) {
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
  }

  function getJSON (url) {
    return getURL(url).then(JSON.parse).catch(function (err) {
      console.log('getJSON failed to load', url);
      throw err;
    });
  }

  function arrow (data, binding) {
    if (!data) throw new Error('arrow() received no data.');

    var endpoint = new BVG('polygon', data, function (tag, data) {
      var angle = Math.atan2(data.end.y - data.begin.y, data.end.x - data.begin.x);
      var offsetX = (data.offset || 0) * Math.cos(angle);
      var offsetY = (data.offset || 0) * Math.sin(angle);
      var points = [
        data.end.x - offsetX,
        data.end.y - offsetY,
        data.end.x - offsetX - data.r * Math.cos(angle - Math.PI / 6),
        data.end.y - offsetY - data.r * Math.sin(angle - Math.PI / 6),
        data.end.x - offsetX - data.r * Math.cos(angle + Math.PI / 6),
        data.end.y - offsetY - data.r * Math.sin(angle + Math.PI / 6)
      ];
      tag.setAttribute('points', points.join(' '));
    });
    var line = new BVG('line', data, function (tag, data) {
      tag.setAttribute('x1', data.begin.x);
      tag.setAttribute('y1', data.begin.y);
      tag.setAttribute('x2', data.end.x);
      tag.setAttribute('y2', data.end.y);
    });
    return {
      line: line,
      endpoint: endpoint
    };
  }

  function drawGameLabel(game, x) {
    var _x = x + getYearWidth() / 2 + 0.2;
    var _y = heinlein_height / 2;
    var rectData = {
      x: x,
      y: _y,
      width: 0,
      height: 0
    };
    var textData = {
      text: game,
      x: _x,
      y: _y
    };
    var rect = BVG_Heinlein.rect(rectData)
                           .fill(BVG.hsla(getHueByYear(data_gameSources[game].Year), 40, 60))
                           .noStroke()
                           .addClass('heinlein-selection');
    var text = BVG_Heinlein.text(textData)
                           .addClass('heinlein-selection');
    var textBBox = text.tag().getBBox();
    var textWidth = textBBox.width;
    var textHeight = textBBox.height;
    rectData.y = (heinlein_height - textWidth) / 2 - 1;
    rectData.x = x - 0.5;
    rectData.width = textHeight + 1;
    rectData.height = textWidth + 2;
    textData.y = (heinlein_height + textWidth) / 2;
    text.attr('transform', 'rotate(-90 ' + _x + ' ' + textData.y + ')');
    return {
      text: text,
      rect: rect
    };
  }

  function updateForceLayout (points, relations) {
    var threshold = 10;

    // Converging variable
    var limit = 1;
    var converge = limit;

    // Reset forces
    var forces = {};
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

        var F;
        if (relations[point].indexOf(other) > -1 || relations[other].indexOf(point) > -1) {
          F = 6 * Math.log(distance / threshold);
        } else {
          F = Math.log(distance / (threshold * 4));
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
      if (!points[point].dragging) {
        points[point].x += forces[point].Fx * 0.1;
        points[point].y += forces[point].Fy * 0.1;
      }
    });

    // Establish convergence
    return converge <= limit;
  }

});