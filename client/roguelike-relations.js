/**
 * Roguelike Universe
 * Author: Xavier Ho <contact@xavierho.com>
 * https://github.com/Spaxe/roguelike-universe
 */
import BVG from "bvg";
import { promise, ratio, getJSON } from "./util";

const server_url = 'http://localhost:8002/api/v1';
const start_year = 1970, end_year = 2020;
const fx = ratio.bind(ratio, start_year, end_year);

document.addEventListener('DOMContentLoaded', () => {

  let bvg = BVG.create('#container');
  let width = bvg.tag().clientWidth;
  let height = bvg.tag().clientHeight;

  loadRoguelikeRelationsAll().then( (relations) => {
    relations.forEach( ({title, year, inspiredBy, inspirationTo, otherInspiredBy, otherInspirationTo}) => {

      let g = bvg.group(`translate(${fx(year) * width} ${height/2 + 15})`)
      let text = g.text(title, 0, 0).transform('rotate(90)');

      inspiredBy.forEach( r => {
        let args = arcYeartoYear(year, r.year);
        args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
        bvg.arc(...args);
      });
      inspirationTo.forEach( r => {
        let args = arcYeartoYear(r.year, year);
        args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
        bvg.arc(...args);
      });

    });
  });
});

const loadRoguelikeRelationsAll = () => {

  return getJSON(`${server_url}/roguelike/relations-all`);

};

let arcYeartoYear = (a, b, invert=-1.0) => {

  let x_a = fx(a, start_year, end_year);
  let x_b = fx(b, start_year, end_year);
  let x = (x_a + x_b) / 2;
  let y = 0.5;
  let rx = Math.abs(x_b - x_a) / 2;
  let ry = rx;
  let startAngle = 0;
  let endAngle = Math.PI * invert;
  return [x, y, rx, ry, startAngle, endAngle];

};
