// Roguelike Universe visualisation
// Author: Xavier Ho <contact@xavierho.com>

const timeScale = d3.scaleTime()
  .range([1970, 2020]);
const timeAxis = d3.axisBottom(timeScale);

const container = d3.select('#influence-arcs div');
const svg = container.append('svg')
  .attr('width', 700)
  .attr('height', 700);

svg.append('g')
  .attr('transform', 'translate(0, 350)')
  .call(timeAxis);