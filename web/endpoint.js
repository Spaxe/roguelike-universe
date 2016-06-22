import SpreadSheet from 'google-spreadsheet-reader';

module.exports = {

  roguelikes: () => {

    let gs_roguelike = new SpreadSheet('1iov1Vh-rjbv4rhVScDaP6aZBW3_hCijDpLpP8HRxyVU');

    return gs_roguelike.load().then( res => {

      let sheet_name = Object.keys(res)[0];
      return res[sheet_name];

    });

  },

  videogames: () => {

    let gs_videogames = new SpreadSheet('1Em1ugWpRuRdguxK0A5qFY1C7gPZsjntrP_FWZte_dNc');

    return gs_videogames.load().then( res => {

      let sheet_name = Object.keys(res)[0];
      return res[sheet_name];

    });

  },

  relations: () => {

    let gs_relations = new SpreadSheet('14-6ZXSABKd8p_1tc9wZiOET7MY5x5krQ0PPBGFyf004');

    return gs_relations.load().then( res => {

      let sheet_name = Object.keys(res)[0];
      return res[sheet_name];

    });

  }

};