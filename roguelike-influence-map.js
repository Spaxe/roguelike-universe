// Roguelike Universe data visualisation
// Author: Xavier Ho <contact@xavierho.com>

;(function () {
  ////////////////////////////////////////////////////////////////////////////////
  // Download data
  Promise.all([
    d3.csv('data/roguelike-influence.csv'),
    d3.csv('data/roguelikelike-influence.csv'),
    d3.json('data/games-influence.json'),
  ]).then(gatherInfluence)
    .then(draw)
    .catch(console.error);

  ////////////////////////////////////////////////////////////////////////////////
  // Setup influence arc diagram
  const margin = { left: 20, top: 20, right: 20, bottom: 20 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const container = d3.select('#influence-map div');
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  const frame = svg.append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

  // Draw axis
  const xScale = d3.scaleLinear()
    .range([0, width]);
  const yScale = d3.scaleLinear()
    .range([height, 0]);

  const xAxis = frame.append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-dasharray', 5)
    .attr('class', 'map axis')
    .attr('x1', width/2)
    .attr('y1', 20)
    .attr('x2', width/2)
    .attr('y2', height-20);

  const yAxis = frame.append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-dasharray', 5)
    .attr('class', 'map axis')
    .attr('x1', 100)
    .attr('y1', height/2)
    .attr('x2', width-100)
    .attr('y2', height/2);

  // Draw labels
  frame.append('text')
    .attr('class', 'map label')
    .attr('fill', '#aaa')
    .attr('text-anchor', 'end')
    .attr('x', width-6)
    .attr('y', 6)
    .text('influential in-genre');

  frame.append('text')
    .attr('class', 'map label')
    .attr('fill', '#aaa')
    .attr('text-anchor', 'start')
    .attr('x', 6)
    .attr('y', 6)
    .text('representative in-genre');

  frame.append('text')
    .attr('class', 'map label')
    .attr('fill', '#aaa')
    .attr('text-anchor', 'end')
    .attr('x', width-6)
    .attr('y', height-6)
    .text('influential out-of-genre');

  frame.append('text')
    .attr('class', 'map label')
    .attr('fill', '#aaa')
    .attr('text-anchor', 'start')
    .attr('x', 6)
    .attr('y', height-6)
    .text('representative out-of-genre');

  frame.append('text')
    .attr('class', 'map label')
    .attr('text-anchor', 'end')
    .attr('alignment-baseline', 'middle')
    .attr('x', width-6)
    .attr('y', height/2)
    .text('influences the future');

  frame.append('text')
    .attr('class', 'map label')
    .attr('text-anchor', 'start')
    .attr('alignment-baseline', 'middle')
    .attr('x', 6)
    .attr('y', height/2)
    .text('influences the past');

  frame.append('text')
    .attr('class', 'map label')
    .attr('text-anchor', 'middle')
    .attr('x', width/2)
    .attr('y', 6)
    .text('influences from roguelikes');

  frame.append('text')
    .attr('class', 'map label')
    .attr('text-anchor', 'middle')
    .attr('x', width/2)
    .attr('y', height-6)
    .text('influences from non-roguelikes');

  function draw (files) {
    return new Promise ( (resolve, reject) => {
      const [
        roguelikeInfluences,
        roguelikelikeInfluences,
        releasedYears,
        influences,
      ] = files;

      // Calculate the genre-influential map absolute positions
      const data = {};
      influences.filter(r => r.categoryA === 'roguelike').forEach(r => {
        if (data[r.titleA] === undefined) {
          data[r.titleA] = {influential: 0, inGenre: 0};
        }

        if (r.yearB > r.yearA) {
          data[r.titleA].influential += 1;
        } else if (r.yearB < r.yearA) {
          data[r.titleA].influential -= 1;
        }

        if (r.categoryB === 'roguelike') {
          data[r.titleA].inGenre += 1;
        } else {
          data[r.titleA].inGenre -= 1;
        }
      });

      const extent = [];
      const positions = Object.keys(data).map(title => {
        extent.push(data[title].influential);
        extent.push(data[title].inGenre);
        return {title: title, x: data[title].influential, y: data[title].inGenre};
      });
      const extreme = Math.max(...extent.map(Math.abs)) + 5;
      xScale.domain([-extreme, extreme]);
      yScale.domain([-extreme/2, extreme/2]);

      // Draw dots on the genre-influential map
      const dots = frame.append('g')
        .attr('class', 'map')
        .selectAll('dot')
        .data(positions)
          .enter();

      dots.append('circle')
        .attr('class', 'roguelike dot')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', d => Math.sqrt(findOnPosition(d)) + 1);

      function findOnPosition (d) {
        return positions.filter(r => r.x === d.x && r.y === d.y).length;
      }

      resolve(files);
    });
  }

})();