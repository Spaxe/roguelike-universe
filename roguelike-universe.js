// Roguelike Universe visualisation
// Author: Xavier Ho <contact@xavierho.com>

function init () {

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
  const width = 700 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

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
    .tickSize(25)
    .tickFormat("");

  const container = d3.select('#influence-arcs div');
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  const frame = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const timeAxis = frame.append('g')
    .attr('class', 'influence axis lighter')
    .attr('transform', `translate(0, ${height/2})`)
    .call(timeAxisBetween);

  const timeAxis1 = frame.append('g')
    .attr('class', 'influence axis')
    .attr('transform', `translate(0, ${height/2})`)
    .call(timeAxisBottom);

  const timeAxis2 = frame.append('g')
    .attr('class', 'influence axis')
    .attr('transform', `translate(0, ${height/2+25})`)
    .call(timeAxisTop);

  ////////////////////////////////////////////////////////////////////////////////
  // Gather influence pairs into a list
  function gatherInfluence (files) {
    return new Promise ( (resolve, reject) => {
      let [
        roguelikeInfluences,
        roguelikelikeInfluences,
        releasedYears
      ] = files;

      // Remove last empty row
      roguelikeInfluences = roguelikeInfluences.slice(0, -1);
      roguelikelikeInfluences = roguelikelikeInfluences.slice(0, -1);

      // transform influences into JSON
      roguelikeInfluences.forEach(r => {
        r.Influences = JSON.parse(r.Influences);
        r.Inferred_Roguelike_Influences = JSON.parse(r.Inferred_Roguelike_Influences);
        r.Inferred_Roguelikelike_Influences = JSON.parse(r.Inferred_Roguelikelike_Influences);
        r.Inferred_Other_Influences = JSON.parse(r.Inferred_Other_Influences);
      });

      roguelikelikeInfluences.forEach(r => {
        r.Influences = JSON.parse(r.Influences);
        r.Inferred_Roguelike_Influences = JSON.parse(r.Inferred_Roguelike_Influences);
        r.Inferred_Roguelikelike_Influences = JSON.parse(r.Inferred_Roguelikelike_Influences);
        r.Inferred_Other_Influences = JSON.parse(r.Inferred_Other_Influences);
      });

      // Loop through the influence dataset and make data rows for arcs
      const influences = [];

      roguelikeInfluences.forEach(r => {
        r.Influences.forEach(i => {
          if (validYears(r.Name, i)) {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelike', categoryB: 'roguelike', type: 'known',
            });
          }
        });

        r.Inferred_Roguelike_Influences.forEach(i => {
          if (validYears(r.Name, i)) {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelike', categoryB: 'roguelike',  type: 'inferred',
            });
          }
        });

        r.Inferred_Roguelikelike_Influences.forEach(i => {
          if (validYears(r.Name, i)) {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelike', categoryB: 'roguelikelike',  type: 'inferred',
            });
          }
        });

        r.Inferred_Other_Influences.forEach(i => {
          if (validYears(r.Name, i)) {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelike', categoryB: 'other',  type: 'inferred',
            });
          }
        });

      });

      roguelikelikeInfluences.forEach(r => {
        r.Influences.forEach(i => {
          if (validYears(r.Name, i)) {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelikelike', categoryB: 'roguelike',  type: 'known',
            });
          }
        });

        r.Inferred_Roguelike_Influences.forEach(i => {
          if (validYears(r.Name, i)) {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelikelike', categoryB: 'roguelike',  type: 'inferred',
            });
          }
        });

        r.Inferred_Roguelikelike_Influences.forEach(i => {
          if (validYears(r.Name, i)) {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelikelike', categoryB: 'roguelikelike',  type: 'inferred',
            });
          }
        });

        r.Inferred_Other_Influences.forEach(i => {
          if (validYears(r.Name, i)) {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelikelike', categoryB: 'other',  type: 'inferred',
            });
          }
        });

      });

      function validYears (a, b) {
        return releasedYears[a]
                && releasedYears[b]
                && releasedYears[a] !== 1000
                && releasedYears[b] !== 1000;
      }

      const output = [
        roguelikeInfluences,
        roguelikelikeInfluences,
        releasedYears,
        influences,
      ];

      resolve(output);
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  // After the data is loaded, draw influence arcs
  function draw (files) {
    const [
      roguelikeInfluences,
      roguelikelikeInfluences,
      releasedYears,
      influences
    ] = files;

    function yearX (name) {
      return timeScale(releasedYears[name]);
    }

    function influenceArc (d) {
      const minYear = Math.min(d.yearA, d.yearB);
      const maxYear = Math.max(d.yearA, d.yearB);
      const yearA = new Date(`${minYear}-01-01`);
      const yearB = new Date(`${maxYear}-01-01`);
      const pointA = timeScale(yearA);
      const pointB = timeScale(yearB);
      let outerRadius = (pointB - pointA) / 2;
      let innerRadius = (pointB - pointA) / 2 - 1;

      if (d.type === 'known') {
        outerRadius += 1;
        innerRadius -= 1;
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

    const arcs = frame.append('g')
      .attr('class', 'influence')
      .selectAll('.arc')
      .data(influences)
      .enter()
        .append('path')
        .attr('transform', d => `translate(${positionArc(d)},${height/2})`)
        .attr('class', 'arc')
        .attr('opacity', d => d.type === 'known' ? 0.05 : 0.025)
        .attr('d', influenceArc);
  }


}
init();