// Data is from the 2018-08 roguelike universe survey and analyses
// https://docs.google.com/spreadsheets/d/1XhyGDdPvbq3mdX19uUZ2r_ITfXTovgTvZAQA4-xrpE0/edit?usp=sharing
const data = [
  [[0, 0, 1, 8, 5], 'Boring', 'Interesting'],
  [[1, 4, 3, 3, 3], 'Confusing', 'Clear'],
  [[0, 0, 8, 6, 0], 'Lacking', 'Useful'],
  [[0, 0, 0, 5, 9], 'Slow', 'Responsive'],
  [[0, 2, 4, 5, 2], 'Inaccurate', 'Correct'],
];

const colours = [
  '#d7191c',
  '#fdae61',
  '#efefaf',
  '#abdda4',
  '#2b83ba',
];

const svg = d3.select('body')
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

const margin = { top: 10, right: 100, bottom: 0, left: 100 };
const width = svg.attr('width') - margin.left - margin.right;
const height = svg.attr('height') - margin.top - margin.bottom;
const chartMarginBottom = 15;
const chartHeight = height / 5 - chartMarginBottom;

const g = svg.append('g')
  .attr('transform', `translate(${margin.left} ${margin.top})`);

const x = d3.scaleLinear()
  .domain([0, 5])
  .range([0, width]);

const y = d3.scaleLinear()
  .domain([0, 10])
  .range([chartHeight, 0]);

data.forEach((d, i) => {
  drawScale(d, 0, i * (chartHeight + chartMarginBottom));
});

function drawScale (data, xOffset, yOffset) {
  const c1 = g.append('g')
    .attr('transform', `translate(${xOffset} ${yOffset})`);
  c1.selectAll('.bar')
    .data(data[0])
    .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => x(i))
      .attr('y', (d, i) => y(d))
      .attr('width', width/5)
      .attr('height', (d, i) => chartHeight - y(d))
      .attr('fill', (d, i) => colours[i]);

  c1.selectAll('.text')
    .data(data[0])
    .enter()
      .append('text')
      .attr('class', 'text')
      .attr('x', (d, i) => x(i) + width/10)
      .attr('y', (d, i) => y(d) - 3)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'baseline')
      .text(d => d === 0 ? '' : d);

  c1.append('line')
    .attr('x1', 0)
    .attr('y1', chartHeight+1)
    .attr('x2', width)
    .attr('y2', chartHeight+1)
    .attr('stroke', 'black')
    .attr('strokeWidth', 1);

  c1.append('text')
    .attr('x', -10)
    .attr('y', chartHeight)
    .attr('text-anchor', 'end')
    .text(data[1]);

  c1.append('text')
    .attr('x', width + 10)
    .attr('y', chartHeight)
    .attr('text-anchor', 'start')
    .text(data[2]);
}