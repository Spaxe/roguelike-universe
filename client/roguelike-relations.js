/**
 * Roguelike Universe
 * Author: Xavier Ho <contact@xavierho.com>
 * https://github.com/Spaxe/roguelike-universe
 */
import BVG from "bvg";
import { promise, ratio, getJSON } from "./util";

const server_url = 'http://188.166.209.155/api/v1';
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
    bvg.text('year',
             0.001 * width,
             height / 2 + 3);
    for (let i = start_year + 2; i < end_year; i++) {
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
        drawArc(bvg, year, r.year, -1.0, 0.1);
      });
      inspirationTo.forEach( r => {
        drawArc(bvg, r.year, year, -1.0, 0.1);
      });
      otherInspiredBy.forEach( r => {
        drawArc(bvg, year, r.year, 1.0, 0.05);
      });
      otherInspirationTo.forEach( r => {
        drawArc(bvg, r.year, year, 1.0, 0.05);
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
            drawArc(focus, relation.year, r.year, -1, 1, 3);
          });
          relation.inspirationTo.forEach( r => {
            drawArc(focus, r.year, relation.year, -1, 1, 3);
          });
          relation.otherInspiredBy.forEach( r => {
            drawArc(focus, relation.year, r.year, 1, 1, 3);
          });
          relation.otherInspirationTo.forEach( r => {
            drawArc(focus, r.year, relation.year, 1, 1, 3);
          });

          return;
        }
      }
    };

    // Fire event to start
    GUI_game.value = selection;
    drawSelection(selection);

  });

  let drawArc = (g, yearA, yearB, invert=-1.0, opacity=1, strokeWidth=1) => {
    let args = arcYeartoYear(yearA, yearB, invert);
    args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
    g.arc(...args).stroke(0, 0, 0, opacity).strokeWidth(strokeWidth);
  }

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

