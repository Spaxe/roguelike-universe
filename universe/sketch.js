/* global R */
'use strict';

// Data
var data_game_year;
var data_years;
var max_year;
var min_year;

// Functions
var normalise_year;

// Layout
var padding = 50;
var w, h;

function preload() {
  data_game_year = loadJSON('generated/games-years.json');
}

function preprocess() {
  data_years = R.values(data_game_year);
  max_year = R.max(data_years);
  min_year = R.min(data_years);

  normalise_year = function (year) {
    return map(year, min_year, max_year+1, 0, 1);
  };
}

function setup () {
  preprocess();
  colorMode(HSB, 1);
  createCanvas(1200, 600);
  w = width - padding * 2;
  h = height - padding * 2;
}

function draw () {
  background(1);
  fill(0.04, 0.8, 0.9, 1);

  var y_scale = 0.2;

  push();
    translate(padding, padding);

    push();
      translate(0, h/2);
      var year_counter = {};
      R.forEach(function (year) {
        var x = normalise_year(year);
        var c = year_counter[year] + 1 || 0;
        var y = c % 2 === 0 ? -Math.ceil(c/2) : Math.ceil(c/2);
        year_counter[year] = c;

        rect(x * w, y * y_scale, Math.floor(w/(max_year-min_year)) - 10, 1);
      }, data_years);

      console.log(R.max(R.values(year_counter)));

      // R.forEach(function (year) {
      //   text(year, normalise_year(year) * w, h/4);
      // }, R.range(min_year, max_year+1));

      // R.forEach(function (c) {
      //   c *= 500;
      //   text(c, w, c/2 * y_scale);
      //   text(c, w, -c/2 * y_scale);
      // }, R.range(0, 5));
    pop();

  pop();
}