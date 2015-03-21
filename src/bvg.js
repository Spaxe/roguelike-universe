/* globals define */
// BVG - Bindable Vector Graphics
// Xavier Ho <contact@xavierho.com>

define([], function () {

  var BVGIDCounter = 0;
  var BVG = function (svg, data, bind) {
    if (typeof svg === 'string')
      svg = document.createElementNS('http://www.w3.org/2000/svg', svg);
    if (!(svg instanceof SVGElement))
      throw new TypeError('svg (' + svg + ') must be SVG tag name or element.');

    Object.observe(data, function(changes) {
      changes.forEach(function (change) {
        bind(svg, change);
      });
    });

    if (!data.id)
      data.id = 'BVG_' + svg.tagName + '_' + BVGIDCounter++;

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

  BVG.create = function (htmlElement) {
    if (typeof htmlElement === 'string')
      htmlElement = document.querySelector(htmlElement);
    if (!(htmlElement instanceof HTMLElement))
      throw new TypeError('htmlElement (' + htmlElement + ') was not found.');

    var svg = BVG.svg('http://www.w3.org/2000/svg',
                      'http://www.w3.org/1999/xlink',
                      1.1,
                      '100%',
                      '100%');
    htmlElement.appendChild(svg);
    return svg;
  };

  /** ### BVG.factory(svg, attrs)
    *
    * *Internal.* Populate the library with functions to create a BVG.
    *
    * This allows name checking for functions since calling an undefined
    * function would fail.
    */
  BVG.factory = function (svg, attrs) {
    BVG[svg] = function () {
      if (arguments.length === 2 &&
          arguments[0] instanceof Object &&
          typeof arguments[1] === 'function') {
        return BVG(svg, arguments[0]. arguments[1]);
      } else {
        var data = {};
        var paranmeters = [];
        for (var i = 0; i < arguments.length; i++) {
          paranmeters.push(arguments[i]);
        }
        attrs.forEach(function (arg) {
          data[arg] = paranmeters.shift();
        });
        return BVG(svg, data, BVG.bindEqual);
      }
    };
  };

  BVG.bindEqual = function (svg, change) {
    if (change.type === 'add' || change.type === 'update') {
      svg.setAttribute(change.name, change.object[change.name]);
    } else if (change.type === 'remove') {
      svg.removeAttribute(change.name);
    }
  };

  var svgElements = {
    svg: ['xmlns', 'xmlns:xlink', 'version', 'width', 'height'],
    g: ['transform'],
    rect: ['x', 'y', 'width', 'height']
  };
  for (var svg in svgElements) {
    BVG.factory(svg, svgElements[svg]);
  }

  return BVG;
});