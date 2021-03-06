//////////////////////////////////////////////////////////////////////////////
// Gather influence pairs into a list
function gatherInfluence (files) {
  return new Promise ( (resolve, reject) => {
    let [
      roguelikeInfluences,
      roguelikelikeInfluences,
      releasedYears
    ] = files;

    // Remove last empty row
    roguelikeInfluences = roguelikeInfluences.slice(0, -1);
    roguelikelikeInfluences = roguelikelikeInfluences.slice(0, -1);

    // transform influences into JSON
    roguelikeInfluences.forEach(r => {
      r.Influences = JSON.parse(r.Influences);
      r.Inferred_Roguelike_Influences = JSON.parse(r.Inferred_Roguelike_Influences);
      r.Inferred_Roguelikelike_Influences = JSON.parse(r.Inferred_Roguelikelike_Influences);
      r.Inferred_Other_Influences = JSON.parse(r.Inferred_Other_Influences);
    });

    roguelikelikeInfluences.forEach(r => {
      r.Influences = JSON.parse(r.Influences);
      r.Inferred_Roguelike_Influences = JSON.parse(r.Inferred_Roguelike_Influences);
      r.Inferred_Roguelikelike_Influences = JSON.parse(r.Inferred_Roguelikelike_Influences);
      r.Inferred_Other_Influences = JSON.parse(r.Inferred_Other_Influences);
    });

    // Loop through the influence dataset and make data rows for arcs
    const influences = [];

    // Add to known influence first before the inferred ones, so we don't overlap.
    roguelikeInfluences.forEach(r => {
      r.Influences.forEach(i => {
        if (validYears(r.Name, i) ) {
          // Temporary patching games out of roguelike list
          // TODO: Consolidate the list of games, and have a field for genre such as roguelike/roguelike-like
          if (i === 'Diablo' || i === 'Diablo II' || i === 'Spelunky' || i === 'The Binding of Isaac') {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelike', categoryB: 'roguelikelike', type: 'known',
            });
          } else {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelike', categoryB: 'roguelike', type: 'known',
            });
          }
        }
      });
    });

    roguelikelikeInfluences.forEach(r => {
      r.Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          // Temporary patching Spelunky out of roguelike list
          if (i === 'Spelunky' || i === 'Diablo II') {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelikelike', categoryB: 'roguelikelike',  type: 'known',
            });
          } else {
            influences.push({
              titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
              categoryA: 'roguelikelike', categoryB: 'roguelike',  type: 'known',
            });
          }
        }
      });
    });

    roguelikeInfluences.forEach(r => {
      r.Inferred_Roguelike_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelike', categoryB: 'roguelike',  type: includedIn(influences, r.Name, i) ? 'known' : 'inferred',
          });
        }
      });

      r.Inferred_Roguelikelike_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelike', categoryB: 'roguelikelike',  type: includedIn(influences, r.Name, i) ? 'known' : 'inferred',
          });
        }
      });

      r.Inferred_Other_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelike', categoryB: 'other',  type: includedIn(influences, r.Name, i) ? 'known' : 'inferred',
          });
        }
      });

    });

    roguelikelikeInfluences.forEach(r => {
      r.Inferred_Roguelike_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelikelike', categoryB: 'roguelike',  type: includedIn(influences, r.Name, i) ? 'known' : 'inferred',
          });
        }
      });

      r.Inferred_Roguelikelike_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelikelike', categoryB: 'roguelikelike',  type: includedIn(influences, r.Name, i) ? 'known' : 'inferred',
          });
        }
      });

      r.Inferred_Other_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelikelike', categoryB: 'other',  type: includedIn(influences, r.Name, i) ? 'known' : 'inferred',
          });
        }
      });

    });

    function validYears (a, b) {
      return releasedYears[a]
              && releasedYears[b]
              && releasedYears[a] !== 1000
              && releasedYears[b] !== 1000;
    }

    function includedIn(rows, a, b) {
      for (let i = 0; i < rows.length; i++) {
        if ( (rows[i].titleA === a && rows[i].titleB === b)
          || (rows[i].titleB === a && rows[i].titleA === b))
        return true;
      }
      return false;
    }

    const output = [
      roguelikeInfluences,
      roguelikelikeInfluences,
      releasedYears,
      influences,
    ];

    resolve(output);
  });
}

function filterRoguelike (influences) {
  return influences.filter(r => {
    return r.categoryA === 'roguelike';
  });
}

function filterByName (influences, name) {
  return influences.filter(r => {
    return r.titleA === name || r.titleB === name;
  });
}

function filterKnown (influences) {
  return influences.filter(r => {
    return r.type === 'known';
  });
}

function filterRoguelikeInfluence (influences) {
  return influences.filter(r => {
    return r.categoryB === 'roguelike';
  });
}

function filterRoguelikelikeInGenre (influences) {
  return influences.filter(r => {
    return r.categoryA === 'roguelikelike' && r.categoryB === 'roguelikelike';
  });
}

function onlyUnique (value, index, self) {
  return self.indexOf(value) === index;
}

function filterUniquePosition (positions) {
  const memory = new Set();
  const filtered = [];
  positions.forEach(r => {
    const id = `${r.x},${r.y}`;
    if (!memory.has(id)) {
      filtered.push(r);
    }
    memory.add(id);
  });
  return filtered;
}

function sign (x) {
  if (x === 0) return 0;
  else return x / Math.abs(x);
}

const roguelike_universe_metadata = {
  author: 'Xavier Ho',
  email: 'contact@xavierho.com',
  author_website: 'https://jumptoglide.com',
  github_website: 'https://github.com/Spaxe/roguelike-universe',
  project_website: 'https://spaxe.github.io/roguelike-universe',
  license: 'Unless otherwise specified, Creative Commons Non-Commercial applies',
  license_url: 'https://creativecommons.org/licenses/by-nc/3.0/',
  acknowledgement: 'RogueTemple and RogueBasin contributors',
  download_date: new Date(),
};