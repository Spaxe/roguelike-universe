import d3 from 'd3';
import _ from 'lodash';
import endpoint from './endpoint';

let margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

let svg = d3.select('#roguelike-relations')
            .append('svg')
            .attr('class', 'relations')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

let frame = svg.append('g')
               .attr("transform", `translate(${margin.left},${margin.top})`);

let x = d3.time.scale()
    .range([0, width])
    .domain([new Date(1960, 1, 1), new Date(2019, 1, 1)]);

let arc = d3.svg.arc();

let xAxis = d3.svg.axis()
    .scale(x)
    .orient('middle');

//////////////////////////

let roguelikes, relations, videogames;

endpoint.roguelikes().then(data => {

  roguelikes = data;

  frame.append('g')
       .attr('class', 'x axis')
       .attr('transform', `translate(0,${height/2})`)
       .call(xAxis);

  return endpoint.videogames();

}).then(data => {

  videogames = data;

  return endpoint.relations();

}).then(data => {

  relations = data;

  relations.forEach(r => {

    let game = _.filter(roguelikes, { title: r.title });
    if (!game.length) {
      console.warn(`${rtitle} is not in the database. Please add it at https://docs.google.com/spreadsheets/d/1iov1Vh-rjbv4rhVScDaP6aZBW3_hCijDpLpP8HRxyVU/edit?usp=drive_web`);
    };
    game = game[0];

    delete r.title;
    for (let title of _.values(r)) {

      let other_game = _.filter(roguelikes, { title });

      if (other_game.length) {

        other_game = other_game[0];

        var x0 = x(new Date(Number(game.year), 1, 1));
        var x1 = x(new Date(Number(other_game.year), 1, 1));
        var r = Math.abs(x1-x0)/2;

        arc.startAngle(Math.PI/2)
           .endAngle(-Math.PI/2)
           .innerRadius(r)
           .outerRadius(r);

        frame.append('path')
             .attr('class', 'relation-arc')
             .attr('transform', `translate(${(x0+x1)/2},${height/2})`)
             .attr('d', arc);

      } else {

        other_game = _.filter(videogames, { title });

        if (other_game.length) {

          other_game = other_game[0];

          var x0 = x(new Date(Number(game.year), 1, 1));
          var x1 = x(new Date(Number(other_game.year), 1, 1));
          var r = Math.abs(x1-x0)/2;

          arc.startAngle(-Math.PI/2)
             .endAngle(-3*Math.PI/2)
             .innerRadius(r)
             .outerRadius(r);

          frame.append('path')
               .attr('class', 'relation-arc')
               .attr('transform', `translate(${(x0+x1)/2},${height/2+25})`)
               .attr('d', arc);

        }

      }

    }

  });

});



