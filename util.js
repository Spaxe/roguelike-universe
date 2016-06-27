export const promise = ( func, ...args ) => {

  return new Promise( ( resolve, reject ) => {
    const callback = ( error, data ) => {
      if (error) reject(error);
      else resolve(data);
    };
    args.push(callback);
    func.apply(func, args);
  });

};

export const ratio = (min, max, x) => {

  return (x - min) / (max - min);

};

export const getURL = (url) => {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function () {
      if (req.status == 200) {
        resolve(req.response);
      } else {
        reject(new Error(req.statusText));
      }
    };
    req.onerror = function() {
      reject(new Error('Network Error'));
    };
    req.send();
  });
};

export const getJSON = (url) => {
  return getURL(url).then(JSON.parse).catch(function (err) {
    console.log('getJSON failed to load', url);
    throw err;
  });
};