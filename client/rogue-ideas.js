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

  loadRoguelikeList().then( (titles) => {
    titles.forEach( ({title, x, y}) => {
      let r = 5;
      bvg.circle(x * width, y + height / 2, r);
    });
  });


  loadRoguelikeRelationsAll().then( (relations) => {
    relations.forEach( ({title, year, inspiredBy, inspirationTo}) => {

      inspiredBy.forEach( r => {
        bvg.arc(...arcYeartoYear(year, r.year));
      });
      inspirationTo.forEach( r => {
        bvg.arc(...arcYeartoYear(r.year, year));
      });

    });
  });
});

const loadRoguelikeList = () => {

  return getJSON(`${server_url}/roguelike/list`).then( roguelikes => {

    const dh = -15;
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

const loadRoguelike = (title) => {

  return getJSON(`${server_url}/roguelike/title/${title}`);

};

const arcYeartoYear = (a, b) => {

  let x_a = fx(a, start_year, end_year);
  let x_b = fx(b, start_year, end_year);
  let x = (x_a + x_b) / 2;
  let y = height / 2;
  let rx = Math.abs(x_b - x_a) / 2 * height;
  let ry = rx;
  let startAngle = 0;
  let endAngle = Math.PI;
  return [x * width, y, rx, ry, startAngle, endAngle];

};
