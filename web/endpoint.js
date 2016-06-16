import gs from 'google-spreadsheet';

let doc_roguelike = new gs('1iov1Vh-rjbv4rhVScDaP6aZBW3_hCijDpLpP8HRxyVU');
// let doc_video_game = new gs('1Em1ugWpRuRdguxK0A5qFY1C7gPZsjntrP_FWZte_dNc');
// let doc_relations = new gs('14-6ZXSABKd8p_1tc9wZiOET7MY5x5krQ0PPBGFyf004');

// const version = '0.1.0';

// export let api = (resource, parameters='') => {
//   const endpoint = `https://tonicdev.io/spaxe/roguelike-universe-gs/${version}/${resource}/${parameters}`;
//   let xhrPromise = new XMLHttpRequestPromise();
//   return xhrPromise.send({
//     method: 'GET',
//     url: endpoint
//   });
// };

export let roguelikes = () => {

  return new Promise( (resolve, reject) => {

    doc_roguelike.getRows( 1, (err, row) => {
      if (err) {
        reject({ error: 'error', message: err });
      } else {
        resolve({ status: 'ok', data: row.map(r => cleanup(r)) });
      }
    });

  });

};

let cleanup = (doc_result) => {
    if (doc_result._xml)
        delete doc_result._xml;
    if (doc_result.id)
        delete doc_result.id;
    if (doc_result._links)
        delete doc_result._links;
    return doc_result;
};