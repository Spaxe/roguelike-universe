// fn by Xavier Ho <contact@xavierho.com>

define(['svg'], function (SVG) {

  var fn = this.fn = function () {};

  // Context functions
  fn.svg = function (elementSelector) {
    return SVG(typeof elementSelector === 'string' ?
      document.querySelector(elementSelector) :
      elementSelector
    );
  }

  fn.arc = function (cx, cy, r, beginAngle, endAngle) {
    var start = fn.polarToCartesian(cx, cy, r, endAngle);
    var end = fn.polarToCartesian(cx, cy, r, beginAngle);
    var arcSweep = (endAngle - beginAngle) <= 180 ? "0" : "1";

    return new SVG.PathArray([
        ["M", start.x, start.y],
        ["A", r, r, 0, arcSweep, 0, end.x, end.y]
    ]);
  };

  // Mathematics and geometry
  fn.polarToCartesian = function (cx, cy, r, angle) {
    return {
      x: cx + (r * Math.cos(angle)),
      y: cy + (r * Math.sin(angle))
    };
  };

  // Utility functions
  fn.each = function (array, callback) {
    for (var i = 0; i < array.length; i++) {
      callback(array[i]);
    }
  };

  fn.eachProp = function (obj, callback) {
    for (var x in obj) {
      if (obj.hasOwnProperty(x)) {
        callback(x, obj[x]);
      }
    }
  };

  fn.has = function (arr, element) {
    return arr.indexOf(element) > -1;
  };

  fn.unique = function (array) {
    return array.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  };

  fn.get = function (url) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = function () {
        if (req.status == 200) {
          resolve(req.response);
        } else {
          reject(Error(req.statusText));
        }
      };
      req.onerror = function() {
        reject(Error('Network Error'));
      };
      req.send();
    });
  };

  fn.getJSON = function (url) {
    if (url instanceof Array) {
      var output = [];
      fn.each(url, function (x) {
        output.push(fn.getJSON(x));
      });
      return output;
    }
    return fn.get(url).then(JSON.parse).catch(function (err) {
      console.log('getJSON failed to load', url);
      throw err;
    });
  };

  return fn;
});
