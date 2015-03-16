// Data
var game_sources;
var game_relations;
var year_bucket;

// Layout
var padding = 50;
var w = 1600;
var h = 1000;
var division = 800;

// Element
var unit = 12;

function preload () {
  game_sources = loadJSON('generated/game-sources.json');
  game_relations = loadJSON('generated/roguelike-relations.json');
}

function preprocess () {
  // Sort games by year with definite order
  year_bucket = {};
  fn.eachProp(game_sources, function (k, v) {
    var year = v['Year'];
    year_bucket[year] = year_bucket[year] ? year_bucket[year].concat([k]) : [k];
  });

  // Generate unit coordinates chronologically
  var i = 0;
  fn.eachProp(year_bucket, function (k, v) {
    fn.each(v, function (game) {
      game_sources[game].index = i;
      i++;
    });
  });
}

function setup () {
  preprocess();
  colorMode(HSB, 1);
  createCanvas(w + 2 * padding, h + 2 * padding);
  noLoop();

  textSize(10);
  textFont('Georgia, Serif');
}

function draw () {
  background(1);
  noStroke();
  fill(0);

  push();
    translate(0, division);
    fn.eachProp(year_bucket, function (k, v) {
      fn.each(v, function(game) {
        var g = game_sources[game];
        var x = g.index * (unit * 1.5);
        rect(x,
             0,
             unit,
             unit / 4);

        // game connections
        push();
          noFill();
          stroke(0);
          fn.each(fn.unique(game_relations[game]), function (other) {
            if (game !== other) {
              var r = game_sources[other];
              var rx = r.index * (unit * 1.5);
              var d = Math.abs(rx-x);
              arc((rx+x)/2 + unit / 2, 0, d, d, PI, 2*PI);
            }
          });
        pop();

        // game titles
        push();
          noStroke();
          fill(0);
          translate(x + 2, unit / 2);
          rotate(PI/2);

          text(game, 0, 0);
        pop();
      });
    });
  pop();
}

// Util functions
var fn = {
  each: function (array, callback) {
    for (var i = 0; i < array.length; i++) {
      callback(array[i]);
    }
  },

  eachProp: function (obj, callback) {
    for (var x in obj) {
      if (obj.hasOwnProperty(x)) {
        callback(x, obj[x]);
      }
    }
  },

  unique: function (array) {
    return array.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  }
};