import d3 from 'd3';
import endpoint from './endpoint';

endpoint.roguelikes().then((res) => {

  d3.select('#roguelike-relations')
    .text(JSON.stringify(res));

}).catch(e => {

  console.error(e);

});