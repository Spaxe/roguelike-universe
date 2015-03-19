/* globals define */
// Super lightweight graphics library
// Xavier Ho <contact@xavierho.com>

define(['fn'], function (fn) {

  // // gx object definition and methods
  // var idn = 0;
  // function gx(obj, parent) {
  //   if (!(typeof obj === 'string' || typeof obj.tag === 'string')) {
  //     throw new TypeError('Invalid gx() tagName. Did you forget to supply it?');
  //   }
  //   var obj = obj.tag ? obj : {tag: obj};
  //   var config = this.config = {};
  //   var element = this.element = document.createElementNS('http://www.w3.org/2000/svg', obj.tag);
  //   this.parent = parent;

  //   // Data binding
  //   // TODO: This is a bit of a wildcard. Needs to do some boundary checking to
  //   //       ensure we're not overriding functions.
  //   Object.observe(config, function (changes) {
  //     changes.forEach(function (change) {
  //       element.setAttribute(change.name, change.object[change.name]);
  //     });
  //   }, ['add', 'update']);

  //   // Set attribute to tags
  //   fn.eachProp(obj, function (k, v) {
  //     if (fn.has(['tag'], k)) return;
  //     config[k] = v;
  //   });

  //   if (!config.id) config.id = 'gx_' + obj.tag + '_' + idn++;
  //   if (parent) parent.element.appendChild(element);

  //   return this;
  // }

  // // Factory methods
  // gx.defineTags = function (funcs) {
  //   fn.eachProp(funcs, function (f, d) {
  //     gx.prototype[f] = function () {
  //       if (arguments.length === 1 && arguments[0].constructor.name === 'Object') {
  //         var args = arguments[0];
  //       } else {
  //         var args = {};
  //         for (var i = 0; i < arguments.length; i++) {
  //           args[d[i]] = arguments[i];
  //         }
  //       }
  //       return new gx(fn.merge({tag: f}, args), this);
  //     };
  //   });
  // };

  // gx.defineTags({
  //   g: ['transform'],
  //   rect: ['x', 'y', 'width', 'height']
  // });

  // // Instance methods
  // gx.prototype.attr = function() {
  //   var config = this.config;
  //   if (arguments.length === 0) {
  //     return this.config;
  //   } else if (arguments.length === 1) {
  //     if (typeof arguments === 'string') {
  //       return this.config[arguments[0]];
  //     } else {
  //       fn.eachProp(arguments[0], function (k, v) {
  //         config[k] = v;
  //       });
  //     }
  //   } else {
  //     var args = [];
  //     for (var i = 0; i < arguments.length; i++) {
  //       args.push(arguments[i]);
  //     }
  //     var attribute = args.shift();
  //     this.config[attribute] = args.join(' ');
  //     return this;
  //   }
  // };

  // // Select an element to create a SVGElement under.
  // // TODO: Support more than one element with this method.
  // gx.svg = function (selector) {
  //   var element = typeof selector === 'string' ? document.querySelector(selector) : undefined;
  //   if (!element)
  //     throw new TypeError('gx.svg() cannot find a valid DOM element: ' + selector);
  //   var svg = new gx({
  //     tag: 'svg',
  //     xmlns: 'http://www.w3.org/2000/svg',
  //     'xmlns:xlink': 'http://www.w3.org/1999/xlink',
  //     version: 1.1,
  //     width: '100%',
  //     height: '100%'
  //   });
  //   element.appendChild(svg.element);
  //   return svg;
  // };

  // gx.arc = function (cx, cy, r, beginAngle, endAngle) {
  //   var start = gx.polarToCartesian(cx, cy, r, endAngle);
  //   var end = gx.polarToCartesian(cx, cy, r, beginAngle);
  //   var arcSweep = (endAngle - beginAngle) <= 180 ? 0 : 1;

  //   return [
  //       ['M', start.x, start.y],
  //       ['A', r, r, 0, arcSweep, 0, end.x, end.y]
  //   ];
  // };

  // // Mathematics and geometry
  // gx.polarToCartesian = function (cx, cy, r, angle) {
  //   return {
  //     x: cx + (r * Math.cos(angle)),
  //     y: cy + (r * Math.sin(angle))
  //   };
  // };

  return gx;

});