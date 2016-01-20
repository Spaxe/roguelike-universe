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

  loadRoguelikeRelationsAll().then( relations => {
    roguelikeRelations(relations);
    genreInfluenceMap(relations);
  });

});

const roguelikeRelations = (relations) => {

  let bvg = BVG.create('#roguelike-relations');
  let focus = bvg.group('');
  let width = bvg.tag().clientWidth;
  let height = bvg.tag().clientHeight;
  let GUI_game = document.getElementById('game');
  let selection = 'Dungeon';

  let drawArc = (g, yearA, yearB, invert=-1.0, opacity=1, strokeWidth=1) => {
    let args = arcYeartoYear(yearA, yearB, invert);
    args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
    g.arc(...args).stroke(0, 0, 0, opacity).strokeWidth(strokeWidth);
  };

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
  bvg.text('In-genre',
           0.001 * width,
           0.1 * height);
  bvg.text('Out-of-genre',
           0.001 * width,
           0.9 * height);


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
};

const genreInfluenceMap = (relations) => {

  let bvg = BVG.create('#genre-influence');
  let focus = bvg.group('');
  let width = bvg.tag().clientWidth;
  let height = bvg.tag().clientHeight;
  let radius = 3;

  // Axis
  bvg.line(0.1 * width, 0.01 * height, 0.1 * width, 0.9 * height).stroke(0);
  bvg.line(0.1 * width, 0.9 * height, 0.99 * width, 0.9 * height).stroke(0);
  let verticalLabelIn = bvg.group(`translate(${0.09 * width} ${0.15 * height})`);
  verticalLabelIn.text('Influences from in-genre', 0, 0).transform('rotate(-90)');
  let verticalLabelOut = bvg.group(`translate(${0.09 * width} ${0.9 * height})`);
  verticalLabelOut.text('Influences from out-of-genre', 0, 0).transform('rotate(-90)');
  bvg.text('Influenced by its past', 0.11 * width, 0.915 * height);
  bvg.text('Influences its future', 0.87 * width, 0.915 * height);

  let max = 0;
  let games = relations.map( ({title, year, inspiredBy, inspirationTo, otherInspiredBy, otherInspirationTo}) => {

    if ([
      'Dungeon Crawl Stone Soup',
      'Pokémon Mystery Dungeon: Explorers of Time and Explorers of Darkness',
      'Shiren the Wanderer',
      'Mystery Dungeon: Shiren the Wanderer',
      'Weird Worlds: Return to Infinite Space',
      'Pokémon Mystery Dungeon: Explorers of Sky',
      'Izuna 2: The Unemployed Ninja Returns',
      'Sword of the Stars: The Pit',
      "Tao's Adventure: Curse of the Demon Sea",
      'Dragon Quest: Shonen Yangus to Fushigi no Dungeon',
      'Teleglitch',
      "Moraff's Revenge",
      'Doom, the Roguelike',
      "Chocobo's Dungeon 2",
      'Not the Robots',
      "Slaves to Armok II: Dwarf Fortress",
      'Izuna: Legend of the Unemployed Ninja',
      'Deadly Dungeons',
      "Tao's Adventure: Curse of the Demon Seal",
      'Chocobo no Fushigina Dungeon',
      'Rogue Legacy'
    ].indexOf(title) >= 0) return {title, x: 0, y: 0};

    let iB = inspiredBy.length;
    let iT = inspirationTo.length;
    let oB = otherInspiredBy.length / 4;
    let oT = otherInspirationTo.length / 4;
    let x = -iB - oB + iT + oT;
    let y = -iB + oB - iT + oT;
    max = Math.max(max, Math.pow(Math.abs(x), 2), Math.pow(Math.abs(y), 2)) + 1;
    return { title, x, y };

  });

  let coordsLUT = {};
  games.forEach( c => {
    let sx = c.x && c.x / Math.abs(c.x);
    let sy = c.y && c.y / Math.abs(c.y);
    let cx = Math.abs(c.x) > 0 ? Math.sqrt(Math.abs(c.x)) * 2 : 0;
    let cy = Math.abs(c.y) > 0 ? Math.sqrt(Math.abs(c.y)) * 2 : 0;
    let x = (0.5 + sx * cx / Math.sqrt(max)) * width;
    let y = (0.5 + sy * cy / Math.sqrt(max)) * height;
    coordsLUT[c.title] = {x, y};
    if (c.x === 0 && c.y === 0) return;
    bvg.circle(x, y, radius).fill(0);
    bvg.text(c.title, x + 5, y + 3).fill(0);
  });

  roguelikeInfluenceTimeline(relations, coordsLUT);

};

const roguelikeInfluenceTimeline = (relations, coordsLUT) => {

  let bvg = BVG.create('#influence-timeline');
  let width = bvg.tag().clientWidth;
  let height = bvg.tag().clientHeight;
  let radius = 3;
  let fy = ratio.bind(ratio, start_year + 7, end_year - 5) ;

  let verticalLabelIn = bvg.group(`translate(${0.007 * width} ${0.04 * height})`);
  verticalLabelIn.text('year', 0, 0).transform('rotate(-90)').fill(0);
  for (let i = start_year + 8; i <= end_year - 6; i++) {
    bvg.text(i.toString(), 0.025 * width, fy(i) * height + 3).fill(0);
  }

  bvg.line(0.015 * width, 0.02 * height, 0.015 * width, 0.99 * height).stroke(0);

  let titlesToOffsetHalf = [
    "Sword of Fargoal",
    "Torneko no Daiboken: Fushigi no Dungeon",
    "Chocobo no Fushigina Dungeon",
    "Super Lotsa Added Stuff Hack - Extended Magic",
    "Tao's Adventure: Curse of the Demon Seal",
    "Pokémon Mystery Dungeon: Explorers of Time and Explorers of Darkness",
    "Shiren the Wanderer",
    "Sword of the Stars: The Pit",
    "Risk of Rain",
    "WazHack",
    "Infinite Space III: Sea of Stars",
    "Smart Kobold",
  ];

  let titlesToOffsetOneThird = [
    "WazHack",
    "Izuna: Legend of the Unemployed Ninja",
  ];

  let titlesToOffsetTwoThirds = [
    "Dungeon Crawl Stone Soup",
    "TowerClimb",
  ];

  const calcOffset = (title) => {
    let offset = titlesToOffsetHalf.indexOf(title) < 0 ? 0 : 16;
        offset = titlesToOffsetOneThird.indexOf(title) < 0 ? offset : 10;
        offset = titlesToOffsetTwoThirds.indexOf(title) < 0 ? offset : 21;
    return offset;
  }

  let connected = {};

  relations.forEach( ({title, year, inspiredBy, inspirationTo}, i) => {

    if (year > 2014 ||
        (inspiredBy.length === 0 && inspirationTo.length === 0))
      return;

    let offset = calcOffset(title);

    let x = coordsLUT[title].x;
    let y = fy(year) * height + offset;

    inspiredBy.forEach( r => {
      if (Math.abs(year - r.year) > 15) return;
      let offset = calcOffset(r.title);
      let x2 = coordsLUT[r.title].x;
      let y2 = fy(r.year) * height + offset;
      bvg.line(x, y, x2, y2);
      connected[r.title] = true;
      connected[title] = true;
    });
    inspirationTo.forEach( r => {
      if (Math.abs(year - r.year) > 15) return;
      let offset = calcOffset(r.title);
      let x2 = coordsLUT[r.title].x;
      let y2 = fy(r.year) * height + offset;
      bvg.line(x, y, x2, y2);
      connected[r.title] = true;
      connected[title] = true;
    });

  });

  relations.forEach( ({title, year}) => {

    let offset = calcOffset(title);

    if (connected[title]) {
      let x = coordsLUT[title].x;
      let y = fy(year) * height + offset;
      bvg.circle(x, y, radius).fill(0);
      bvg.text(title, x + 5, y + 3).fill(0);
    }

  });

};

const loadRoguelikeRelationsAll = () => {

  return getJSON(`${server_url}/roguelike/relations-all`);

};

let arcYeartoYear = (a, b, invert=-1.0) => {

  let x_a = fx(a);
  let x_b = fx(b);
  let x = (x_a + x_b) / 2;
  let y = 0.5 + 0.01 * invert;
  let rx = Math.abs(x_b - x_a) / 2;
  let ry = rx;
  let startAngle = 0;
  let endAngle = Math.PI * invert;
  return [x, y, rx, ry, startAngle, endAngle];

};

