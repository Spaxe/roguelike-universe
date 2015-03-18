/* globals define */
// Super lightweight graphics library
// Xavier Ho <contact@xavierho.com>

define(['fn', 'observe'], function (fn) {

  // gx object definition and methods
  var idn = 0;
  var gxFrame = null;
  function gx(obj) {
    if (!(typeof obj === 'string' || typeof obj.tag === 'string')) {
      throw new TypeError('Invalid gx() tagName. Did you forget to supply it?');
    }
    var obj = obj.tag ? obj : {tag: obj};
    var config = this.config = {};
    var element = document.createElementNS('http://www.w3.org/2000/svg', obj.tag);
    var objFrame = gxFrame;

    // Data binding
    Object.observe(config, function (changes) {
      changes.forEach(function (change) {
        element.setAttribute(change.name, change.object[change.name]);
      });
    }, ['add', 'update']);

    // Set attribute to tags
    fn.eachProp(obj, function (k, v) {
      if (fn.has(['tag'], k)) return;
      config[k] = v;
    });

    if (!config.id) config.id = 'gx_' + config.tag + '_' + idn++;
    if (objFrame) objFrame.appendChild(element);

    return element;
  }

  // Factory static methods
  gx.defineTags = function (funcs) {
    fn.eachProp(funcs, function (f, d) {
      gx[f] = function () {
        var args = {};
        for (var i = 0; i < arguments.length; i++) {
          args[d[i]] = arguments[i];
        }
        return new gx(fn.merge({tag: f}, args));
      };
    });
  };

  gx.defineTags({
    svg: [],
    rect: ['x', 'y', 'width', 'height']
  });

  // Instance methods
  gx.prototype.attr = function() {
    if (arguments.length === 0) {
      return this.config;
    } else if (arguments.length === 1) {
      return this.config[arguments[0]];
    } else {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      var attribute = args.shift();
      this.config[attribute] = args.join(' ');
      return this;
    }
  };

  // static methods
  gx.frame = function (selector) {
    if (typeof selector === 'string') {
      var element = document.querySelector(selector);
      if (!element)
        throw new Error('You must supply a valid DOM selector as argument to start gx().');
      gxFrame = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      if (element instanceof Array) {
        element.forEach(function (e) {
          e.appendChild(gxFrame);
        });
      } else {
        element.appendChild(gxFrame);
      }
    } else {
      gxFrame = selector;
    }
    return this;
  };

  gx.arc = function (cx, cy, r, beginAngle, endAngle) {
    var start = gx.polarToCartesian(cx, cy, r, endAngle);
    var end = gx.polarToCartesian(cx, cy, r, beginAngle);
    var arcSweep = (endAngle - beginAngle) <= 180 ? 0 : 1;

    return [
        ['M', start.x, start.y],
        ['A', r, r, 0, arcSweep, 0, end.x, end.y]
    ];
  };

  // Mathematics and geometry
  gx.polarToCartesian = function (cx, cy, r, angle) {
    return {
      x: cx + (r * Math.cos(angle)),
      y: cy + (r * Math.sin(angle))
    };
  };

  return gx;

});