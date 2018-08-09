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
    .then(setupUI)
    .catch(console.error);

  ////////////////////////////////////////////////////////////////////////////////
  // Setup influence arc diagram
  const margin = { left: 20, top: 20, right: 20, bottom: 20 };
  const width = 800 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;
  const axisWidth = 25;

  const timeRange = [new Date('1969-12-31'), new Date('2020-01-01')];
  const timeScale = d3.scaleTime()
    .domain(timeRange)
    .range([0, width]);
  const timeAxisBottom = d3.axisBottom(timeScale)
    .ticks(d3.timeYear.every(5));
  const timeAxisTop = d3.axisTop(timeScale)
    .ticks(d3.timeYear.every(5))
    .tickFormat("");
  const timeAxisBetween = d3.axisBottom(timeScale)
    .ticks(d3.timeYear.every(1).filter(d => d.getYear() % 5 !== 0))
    .tickSize(axisWidth)
    .tickFormat("");

  const container = d3.select('#influence-arcs div');
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  const frame = svg.append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

  // Year Axis
  const timeAxis = frame.append('g')
    .attr('class', 'influence axis lighter')
    .attr('transform', `translate(0 ${height/2})`)
    .call(timeAxisBetween);

  const timeAxis1 = frame.append('g')
    .attr('class', 'influence axis')
    .attr('transform', `translate(0 ${height/2})`)
    .call(timeAxisBottom);

  const timeAxis2 = frame.append('g')
    .attr('class', 'influence axis')
    .attr('transform', `translate(0 ${height/2+axisWidth})`)
    .call(timeAxisTop);

  const timeLabel = frame.append('g')
    .attr('class', 'influence label')
    .attr('transform', `translate(-20 ${height/2-6})`)
    .append('text')
    .text('year released');

  // Labels
  const labels = frame.append('g')
    .attr('class', 'influence label lighter');
  labels.append('text')
    .text('influences roguelikes games')
    .attr('x', -20)
    .attr('y', 10);
  labels.append('text')
    .text('influences other genres')
    .attr('x', -20)
    .attr('y', height-10)

  //////////////////////////////////////////////////////////////////////////////
  // After the data is loaded, draw influence arcs
  function draw (files) {
    return new Promise ( (resolve, reject) => {
      const [
        roguelikeInfluences,
        roguelikelikeInfluences,
        releasedYears,
        influences
      ] = files;

      const roguelikeInfluenceInGenre = frame.append('g')
        .attr('class', 'roguelike in-genre influence')
        .selectAll('.arc')
        .data(filterRoguelike(influences))
        .enter()
          .append('path')
          .attr('transform', d => {
            if (d.categoryB === 'roguelike') {
              return `translate(${positionArc(d)} ${height/2})`;
            } else {
              return `translate(${positionArc(d)} ${height/2+axisWidth}) rotate(180)`;
            }
          })
          .attr('class', 'arc')
          .attr('opacity', d => d.categoryB === 'roguelike' ? 0.0125 : 0.025)
          .attr('d', influenceArc)
        .exit().remove();

      resolve(files);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Setup user interface
  function setupUI (files) {
    return new Promise ( (resolve, reject) => {
      const [
        roguelikeInfluences,
        roguelikelikeInfluences,
        releasedYears,
        influences
      ] = files;

      // Populate the dropdown menu
      const select = d3.select('#roguelike-arc-selection');
      const hyperlink = d3.select('#roguelike-arc-roguetemple');
      const project = d3.select('#roguelike-arc-project');
      const theme = d3.select('#roguelike-arc-theme');
      const developer = d3.select('#roguelike-arc-developer');
      const released = d3.select('#roguelike-arc-released');
      const updated = d3.select('#roguelike-arc-updated');
      const count = d3.select('#roguelike-arc-count');

      roguelikeInfluences.forEach( r => {
        const year = releasedYears[r.Name];

        if (year !== 1000) {
          const option = select.append('option')
            .attr('value', r.Name)
            .text(`${r.Name} (${year})`);
          // Default selection on load
          if (r.Name === 'NetHack') {
            option.attr('selected', true);
          }
        }

      });

      // Display influence arcs on selection
      select.on('change', drawGameInfluence);

      function drawGameInfluence () {
        const title = d3.event.target.value
        const year = releasedYears[title];
        const x = timeScale(new Date(`${year}-01-01`));
        const datum = roguelikeInfluences.filter(r => r.Name === title)[0];
        const relatedInfluences = filterByName(influences, title);
        const influenceCount = relatedInfluences.length;
        const knownInfluenceCount = filterKnown(relatedInfluences).length;

        // Display metadata
        hyperlink.html('Title: ');
        hyperlink.append('a')
          .attr('href', datum['RogueTemple'] || "#")
          .attr('target', '_blank')
          .text(title);

        project.html('Project page: ');
        project.append('a')
          .attr('href', datum['Link'] || "#")
          .attr('target', '_blank')
          .text(datum['Link'] || "N/A");

        theme.text(`Theme: ${datum['Theme'] || 'N/A'}`)
          .attr('title', datum['Theme'] || 'N/A');
        developer.text(`Developer: ${datum['Developer'] || 'N/A'}`)
          .attr('title', datum['Developer'] || 'N/A');
        released.text(`Initial release: ${datum['Released'] || 'N/A'}`)
          .attr('title', datum['Released'] || 'N/A');
        updated.text(`Most recent update: ${datum['Updated'] || 'N/A'}`)
          .attr('title', datum['Updated'] || 'N/A');
        count.text(`Estimated influence: ${influenceCount > 1 ? influenceCount + ' games' : influenceCount + ' game'} (${knownInfluenceCount} known)`)
          .attr('title', `${influenceCount} (${knownInfluenceCount} known)`);


        // Remove previous selection
        frame.selectAll('.active').remove();

        // Draw current selection
        const active = frame.append('g')
          .attr('class', 'active')

        active.append('line')
          .attr('stroke', 'black')
          .attr('stroke-width', 0.5)
          .attr('x1', x)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', height);

        active.append('text')
          .attr('x', () => x > width/2 ? -6 + x : 6 + x)
          .attr('y', 8)
          .style('font-weight', 500)
          .attr('text-anchor', () => x > width/2 ? 'end' : 'start')
          .text(`${title} (${year})`);

        active.selectAll('.arc')
          .data(filterByName(influences, title))
          .enter()
            .append('path')
            .attr('class', 'arc')
            .attr('transform', d => {
              if (d.categoryB === 'roguelike') {
                return `translate(${positionArc(d)} ${height/2})`;
              } else {
                return `translate(${positionArc(d)} ${height/2+axisWidth}) rotate(180)`;
              }
            })
            .attr('opacity', 1)
            .attr('d', influenceArc)
          .exit().remove();
      }
      select.dispatch('change');

      resolve(files);
    });
  }

  function influenceArc (d) {
    const minYear = Math.min(d.yearA, d.yearB);
    const maxYear = Math.max(d.yearA, d.yearB);
    const yearA = new Date(`${minYear}-01-01`);
    const yearB = new Date(`${maxYear}-01-01`);
    const pointA = timeScale(yearA);
    const pointB = timeScale(yearB);
    let outerRadius = Math.ceil((pointB - pointA) / 2);
    let innerRadius = Math.ceil((pointB - pointA) / 2 - 0.5);

    if (d.type === 'known') {
      outerRadius += 1.5;
      innerRadius -= 1.5;
    }

    return d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)();
  };

  function positionArc (d) {
    const minYear = Math.min(d.yearA, d.yearB);
    const maxYear = Math.max(d.yearA, d.yearB);
    const yearA = new Date(`${minYear}-01-01`);
    const yearB = new Date(`${maxYear}-01-01`);
    const pointA = timeScale(yearA);
    const pointB = timeScale(yearB);
    return (pointA + pointB) / 2;
  }

})();