define([], function () {

  var fn = this.fn = function () {};

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

  fn.merge = function (a, b) {
    var c = {};
    for (var i in a)
      if (a.hasOwnProperty(i))
        c[i] = a[i];
    for (var i in b)
      if (b.hasOwnProperty(i))
        c[i] = b[i];
    return c;
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
