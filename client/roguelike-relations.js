/**
 * Roguelike Universe
 * Author: Xavier Ho <contact@xavierho.com>
 * https://github.com/Spaxe/roguelike-universe
 */
import BVG from "bvg";
import { promise, ratio, getJSON } from "./util";

const server_url = 'http://localhost:8002/api/v1';

let width = 750, height = 750;
let start_year = 1970, end_year = 2020;
const fx = ratio.bind(ratio, start_year, end_year);

document.addEventListener('DOMContentLoaded', () => {

  let bvg = BVG.create('#container');

  loadRoguelikeRelationsAll().then( (relations) => {
    relations.forEach( ({title, year, inspiredBy, inspirationTo, otherInspiredBy, otherInspirationTo}) => {

      inspiredBy.forEach( r => {
        bvg.arc(...arcYeartoYear(year, r.year));
      });
      inspirationTo.forEach( r => {
        bvg.arc(...arcYeartoYear(r.year, year));
      });
      otherInspiredBy.forEach( r => {
        bvg.arc(...arcYeartoYear(year, r.year, 1.0));
      });
      otherInspirationTo.forEach( r => {
        bvg.arc(...arcYeartoYear(r.year, year, 1.0));
      });

    });
  });
});

const loadRoguelikeList = () => {

  return getJSON(`${server_url}/roguelike/list`).then( roguelikes => {

    const dh = 15;
    let counter = {};

    return roguelikes.map( r => {
      let x = fx(r.year);
      counter[r.year] = typeof counter[r.year] === 'number' ? counter[r.year] + 1 : 1;
      let y = counter[r.year] * dh;
      return {title: r.title, x, y};
    });

  });

};

const loadRoguelikeRelationsAll = () => {

  return getJSON(`${server_url}/roguelike/relations-all`);

};

const arcYeartoYear = (a, b, invert=-1.0) => {

  let x_a = fx(a, start_year, end_year);
  let x_b = fx(b, start_year, end_year);
  let x = (x_a + x_b) / 2;
  let y = height / 2;
  let rx = Math.abs(x_b - x_a) / 2 * height;
  let ry = rx;
  let startAngle = 0;
  let endAngle = Math.PI * invert;
  return [x * width, y, rx, ry, startAngle, endAngle];

};
