/**
 * Roguelike Universe
 * Author: Xavier Ho <contact@xavierho.com>
 * https://github.com/Spaxe/roguelike-universe
 */
import React from 'react';
import ReactDOM from 'react-dom';
import RoguelikeRelations from './roguelike-relations';

ReactDOM.render(
  <RoguelikeRelations />,
  document.getElementById('container')
);

// document.addEventListener('DOMContentLoaded', () => {

  // let bvg = BVG.create('#container');
  // let GUI_selection = document.getElementById('game');
  // let width = bvg.tag().clientWidth;
  // let height = bvg.tag().clientHeight;

  // let timeline = [];
  // for (let i = start_year + 1; i < end_year; i++) {
  //   timeline.push({
  //     tag: 'text',
  //     data: {
  //       text: i.toString().substr(2, 4),
  //       x: (fx(i) - 0.005) * width,
  //       y: height / 2 + 3
  //     }
  //   });
  // }

  // timeline.forEach( time => {
  //   let text = new BVG(time.tag, time.data);
  //   bvg.append(text);
  // });

  // loadRoguelikeList().then( games => {

  //   games.forEach( game => {
  //     let option = document.createElement('option');
  //     option.value = option.innerHTML = game.title;
  //     GUI_selection.appendChild(option);
  //   });

  // });

  // let selection = 0;

  // loadRoguelikeRelationsAll().then( (relations) => {
  //   relations.forEach( ({title, year, inspiredBy, inspirationTo, otherInspiredBy, otherInspirationTo}, i) => {

  //     let strokeOpacity = i === selection ? 1.0 : 0.05;
  //     let strokeWidth = i === selection ? 3.0 : 1.0;

  //     if (i === selection) {
  //       bvg.line(fx(year) * width, height * 0.1, fx(year) * width, height * 0.9).strokeWidth(2).stroke(0, 0, 0, 0.5);
  //     }

  //     inspiredBy.forEach( r => {
  //       let args = arcYeartoYear(year, r.year);
  //       args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
  //       bvg.arc(...args).stroke(0, 0, 0, strokeOpacity).strokeWidth(strokeWidth);
  //     });
  //     inspirationTo.forEach( r => {
  //       let args = arcYeartoYear(r.year, year);
  //       args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
  //       bvg.arc(...args).stroke(0, 0, 0, strokeOpacity).strokeWidth(strokeWidth);
  //     });
  //     otherInspiredBy.forEach( r => {
  //       let args = arcYeartoYear(year, r.year, 1.0);
  //       args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
  //       bvg.arc(...args).stroke(0, 0, 0, strokeOpacity).strokeWidth(strokeWidth);
  //     });
  //     otherInspirationTo.forEach( r => {
  //       let args = arcYeartoYear(r.year, year, 1.0);
  //       args[0] *= width; args[1] *= height; args[2] *= height; args[3] *= height;
  //       bvg.arc(...args).stroke(0, 0, 0, strokeOpacity).strokeWidth(strokeWidth);
  //     });

  //   });
  // });

// });

const loadRoguelikeList = () => {

  return getJSON(`${server_url}/roguelike/list`);

};

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
