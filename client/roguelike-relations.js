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
  let focus = bvg.group({});
  let width = bvg.tag().clientWidth;
  let height = bvg.tag().clientHeight;
  let GUI_game = document.getElementById('game');
  let selection = 'Dungeon';

  loadRoguelikeRelationsAll().then( relations => {

    // Draw timeline
    for (let i = start_year + 1; i < end_year; i++) {
      bvg.text(i.toString().substr(2, 4),
               (fx(i) - 0.005) * width,
               height / 2 + 3
      );
    }

    // Populate game titles
    relations.forEach( game => {
      let option = document.createElement('option');
      option.value = game.title;
      option.setAttribute('data-year', game.year);
      option.innerHTML = `${game.title} (${game.year})`;
      GUI_game.appendChild(option);
    });

    // Bind selection
    GUI_game.addEventListener('change', event => {
      selection = event.target.value;
      drawSelection(selection);
    });

    // Draw influence arcs
    relations.forEach( ({title, year, inspiredBy, inspirationTo, otherInspiredBy, otherInspirationTo}) => {

      inspiredBy.forEach( r => {
        let args = arcYeartoYear(year, r.year);
        args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
        bvg.arc(...args).stroke(0, 0, 0, 0.2);
      });
      inspirationTo.forEach( r => {
        let args = arcYeartoYear(r.year, year);
        args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
        bvg.arc(...args).stroke(0, 0, 0, 0.2);
      });
      otherInspiredBy.forEach( r => {
        let args = arcYeartoYear(year, r.year, 1.0);
        args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
        bvg.arc(...args).stroke(0, 0, 0, 0.05);
      });
      otherInspirationTo.forEach( r => {
        let args = arcYeartoYear(r.year, year, 1.0);
        args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
        bvg.arc(...args).stroke(0, 0, 0, 0.05);
      });

    });

    let drawSelection = (selection) => {
      focus.tag().innerHTML = '';

      for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        if (relation.title === selection) {

          focus.text(selection, fx(relation.year) * width, 0.095 * height)
            .fill(0);

          focus.line({
            x1: fx(relation.year) * width,
            y1: height * 0.1,
            x2: fx(relation.year) * width,
            y2: height * 0.9
          }).strokeWidth(2).stroke(0, 0, 0, 0.5);

          relation.inspiredBy.forEach( r => {
            let args = arcYeartoYear(relation.year, r.year);
            args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
            focus.arc(...args).stroke(0, 0, 0, 1).strokeWidth(3);
          });
          relation.inspirationTo.forEach( r => {
            let args = arcYeartoYear(r.year, relation.year);
            args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
            focus.arc(...args).stroke(0, 0, 0, 1).strokeWidth(3);
          });
          relation.otherInspiredBy.forEach( r => {
            let args = arcYeartoYear(relation.year, r.year, 1.0);
            args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
            focus.arc(...args).stroke(0, 0, 0, 1).strokeWidth(3);
          });
          relation.otherInspirationTo.forEach( r => {
            let args = arcYeartoYear(r.year, relation.year, 1.0);
            args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
            focus.arc(...args).stroke(0, 0, 0, 1).strokeWidth(3);
          });

          return;
        }
      }
    };

    // Fire event to start
    GUI_game.value = selection;
    drawSelection(selection);

  });

});

const loadRoguelikeRelationsAll = () => {

  return getJSON(`${server_url}/roguelike/relations-all`);

};

let arcYeartoYear = (a, b, invert=-1.0) => {

  let x_a = fx(a, start_year, end_year);
  let x_b = fx(b, start_year, end_year);
  let x = (x_a + x_b) / 2;
  let y = 0.5 + 0.01 * invert;
  let rx = Math.abs(x_b - x_a) / 2;
  let ry = rx;
  let startAngle = 0;
  let endAngle = Math.PI * invert;
  return [x, y, rx, ry, startAngle, endAngle];

};
