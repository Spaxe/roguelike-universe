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
    .domain([new Date(1978, 1, 1), new Date()]);

let xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(d3.time.years, 1)
    .tickFormat(d => {
      if (d.getFullYear() % 5 !== 0) return '·';
      else return d.getFullYear();
    });

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

    const draw_arc = (game, other_game, upside) => {
      let x0 = x(new Date(Number(game.year), 1, 1));
      let x1 = x(new Date(Number(other_game.year), 1, 1));
      let r = Math.abs(x1-x0)/2;

      let arc = d3.svg.arc().startAngle(upside ? Math.PI/2 : -Math.PI/2)
                            .endAngle(upside ? -Math.PI/2 : -3*Math.PI/2)
                            .innerRadius(r)
                            .outerRadius(r);

      return frame.append('path')
                  .attr('class', `relation-arc ${upside ? 'up' : 'down'}`)
                  .attr('transform', `translate(${(x0+x1)/2},${upside ? height/2 : height/2+25})`)
                  .attr('d', arc);
    };

    const draw_label = (game) => {
      let x0 = x(new Date(Number(game.year), 1, 1));

      return frame.append('text')
                  .attr('class', 'game-title')
                  .attr('transform', `translate(${x0},${height/2}) rotate(90)`)
                  .attr('x', 0)
                  .attr('y', 0)
                  .attr('text-anchor', 'middle')
                  .text(game.title);
    };

    delete r.title;
    for (let title of _.values(r)) {

      let this_arc;
      let other_game = _.filter(roguelikes, { title });

      if (other_game.length) {
        this_arc = draw_arc(game, other_game[0], true);
      } else {
        other_game = _.filter(videogames, { title });
        if (other_game.length) {
          this_arc = draw_arc(game, other_game[0], false);
        }
      }

      if (this_arc) {
        let game_label, other_label;
        this_arc.on('mouseover', () => {
          this_arc.classed('active', true);
          game_label = draw_label(game);
          other_label = draw_label(other_game[0]);
        });
        this_arc.on('mouseout', () => {
          this_arc.classed('active', false);
          game_label.remove();
          other_label.remove();
        });
      }

    }

  });

});



