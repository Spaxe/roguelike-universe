/* globals define */
// BVG - Bindable Vector Graphics
// Xavier Ho <contact@xavierho.com>

define([], function () {

  var bvgIDCounter = 0;
  var bvg = function (svg, data, bind) {
    if (typeof svg === 'string')
      svg = document.createElementNS('http://www.w3.org/2000/svg', svg);
    if (!(svg instanceof SVGElement))
      throw new TypeError('svg (' + svg + ') must be a SVG tag name or element.');

    Object.observe(data, function(changes) {
      changes.forEach(function (change) {
        bind(svg, change);
      });
    });

    if (!data.id)
      data.id = 'bvg_' + svg.tagName + '_' + bvgIDCounter++;

    for (var name in data) {
      if (data.hasOwnProperty(name)) {
        bind(svg, {
          type: 'add',
          object: data,
          name: name
        });
      }
    }

    svg.data = data;
    svg.bind = bind;
    return svg;
  };

  bvg.create = function (htmlElement) {
    if (typeof htmlElement === 'string')
      htmlElement = document.querySelector(htmlElement);
    if (!(htmlElement instanceof HTMLElement))
      throw new TypeError('htmlElement (' + htmlElement + ') was not found.');

    var svg = bvg.svg('http://www.w3.org/2000/svg',
                      'http://www.w3.org/1999/xlink',
                      1.1,
                      '100%',
                      '100%');
    htmlElement.appendChild(svg)
    return svg;
  }

  bvg.factory = function (svg, attrs) {
    bvg[svg] = function () {
      var data = {};
      var paranmeters = [];
      for (var i = 0; i < arguments.length; i++) {
        paranmeters.push(arguments[i]);
      }
      attrs.forEach(function (arg) {
        data[arg] = paranmeters.shift();
      });
      return bvg(svg, data, bvg.bindEqual);
    };
  };

  bvg.bindEqual = function (svg, change) {
    if (change.type === 'add' || change.type === 'update') {
      svg.setAttribute(change.name, change.object[change.name]);
    } else if (change.type === 'remove') {
      svg.removeAttribute(change.name);
    }
  };

  var svgElements = {
    svg: ['xmlns', 'xmlns:xlink', 'version', 'width', 'height'],
    rect: ['x', 'y', 'width', 'height']
  };
  for (var svg in svgElements) {
    bvg.factory(svg, svgElements[svg]);
  }

  return bvg;
});