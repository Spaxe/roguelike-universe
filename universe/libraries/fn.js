// fn by Xavier Ho <contact@xavierho.com>
var fn = {

  // Utility functions
  each: function (array, callback) {
    for (var i = 0; i < array.length; i++) {
      callback(array[i]);
    }
  },

  eachProp: function (obj, callback) {
    for (var x in obj) {
      if (obj.hasOwnProperty(x)) {
        callback(x, obj[x]);
      }
    }
  },

  unique: function (array) {
    return array.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  },

  get: function (url) {
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
  },

  getJSON: function (url) {
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
  },

  // Context functions
  svg: function(id) {
    return SVG(id).fixSubPixelOffset();
  }
};
