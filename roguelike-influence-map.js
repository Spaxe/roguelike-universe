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
  const height = 500 - margin.top - margin.bottom;

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
    .attr('x1', 110)
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
    .text('influenced by the past');

  frame.append('text')
    .attr('class', 'map label')
    .attr('text-anchor', 'middle')
    .attr('x', width/2)
    .attr('y', 6)
    .text('related more to roguelikes');

  frame.append('text')
    .attr('class', 'map label')
    .attr('text-anchor', 'middle')
    .attr('x', width/2)
    .attr('y', height-6)
    .text('related more to other genres');

  // Draw legends
  const legends = frame.append('g')
    .attr('class', 'map legend')
    .attr('transform', `translate(${width - 100} ${height - 50})`);
  const radius = [2, 3, 4, 5, 7];
  legends.selectAll('dot')
    .data(radius)
    .enter()
      .append('circle')
      .attr('class', 'roguelike dot legend')
      .attr('cx', (d, i) => d + 15 * i)
      .attr('cy', d => -d)
      .attr('r', d => d);
  legends.append('text')
    .text('number of games')
    .attr('text-anchor', 'middle')
    .attr('class', 'map legend')
    .attr('x', 36)
    .attr('y', -18);
  legends.append('text')
    .text('fewer')
    .attr('class', 'map legend')
    .attr('x', -3)
    .attr('y', 12);
  legends.append('text')
    .text('more')
    .attr('text-anchor', 'end')
    .attr('class', 'map legend')
    .attr('x', 75)
    .attr('y', 12);

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
          data[r.titleA].influential += 2;
        } else if (r.yearB < r.yearA) {
          data[r.titleA].influential -= 1;
        }

        if (r.categoryB === 'roguelike') {
          data[r.titleA].inGenre += 2;
        } else {
          data[r.titleA].inGenre -= 1;
        }
      });

      const extent = [];
      const positions = Object.keys(data).map(title => {
        const x = data[title].influential;
        const y = data[title].inGenre;
        extent.push(x);
        extent.push(y);
        return {title: title, x: x, y: y};
      });
      const extreme = Math.max(...extent.map(Math.abs)) + 5;
      xScale.domain([-extreme/1.5, extreme/1.5]);
      yScale.domain([-extreme/2, extreme/2]);

      // Draw dots on the genre-influential map
      const dots = frame.append('g')
        .attr('class', 'map')
        .selectAll('dot')
        .data(filterUniquePosition(positions))
          .enter();

      dots.append('circle')
        .attr('class', 'roguelike dot')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', d => Math.sqrt(findOnPosition(d).length) + 2)
        .attr('stroke', 'transparent')
        .attr('stroke-width', 10)
        .on('click', displayTitles)
        .on('focus', displayTitles)
        .on('mousemove', displayTooltip)
        .on('mouseout', removeTooltip);

      function findOnPosition (d) {
        return filterTitle(positions.filter(r => r.x === d.x && r.y === d.y)).filter(onlyUnique);
      }

      function filterTitle (positions) {
        return positions.map(r => r.title);
      }

      function displayTitles (d) {
        const titles = findOnPosition(d);
        const list = d3.select('#roguelike-map-selected');

        list.html('Selected: ');
        const selectedList = list.selectAll('.list')
          .data(titles)
          .enter();
        selectedList.append('span')
          .attr('class', 'list mr1')
          .text(d => d)
          .exit().remove();

        frame.selectAll('.active').remove();
        frame.append('circle')
          .attr('class', 'roguelike dot active')
          .attr('cx', _ => xScale(d.x))
          .attr('cy', _ => yScale(d.y))
          .attr('r', _ => Math.sqrt(findOnPosition(d).length) + 2);
      }

      function displayTooltip (d) {
        let tooltip = container.select('#map-tooltip');
        if (!tooltip.node()) {
          tooltip = container.append('div')
            .attr('id', 'map-tooltip')
            .style('max-width', '250px')
            .attr('class', 'tooltip smallerer');
        }
        tooltip.html(`
          <em>${findOnPosition(d).join(', ')}</em>
        `);
        const tooltipWidth = tooltip.node().getBoundingClientRect().width;
        tooltip.style('position', 'absolute')
          .style('top', `${d3.event.layerY + 3}px`)
          .style('left', `${d3.event.layerX > width/2 ? d3.event.layerX - tooltipWidth - 6 : d3.event.layerX + 6}px`);
      }

      function removeTooltip () {
        container.select('#map-tooltip').remove();
      }

      // Prepare the data source for download
      const download = {metadata: roguelike_universe_metadata, data: positions};
      const blob = new Blob([JSON.stringify(download, null, 2)], {type: 'application/json'});
      const download_url = URL.createObjectURL(blob);
      document.querySelector('#roguelike-map-data').href = download_url;

      resolve(files);
    });
  }

})();