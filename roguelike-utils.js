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

    roguelikeInfluences.forEach(r => {
      r.Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          // Temporary patching Diablo out of roguelike list
          if (i === 'Diablo') {
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

      r.Inferred_Roguelike_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelike', categoryB: 'roguelike',  type: 'inferred',
          });
        }
      });

      r.Inferred_Roguelikelike_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelike', categoryB: 'roguelikelike',  type: 'inferred',
          });
        }
      });

      r.Inferred_Other_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelike', categoryB: 'other',  type: 'inferred',
          });
        }
      });

    });

    roguelikelikeInfluences.forEach(r => {
      r.Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelikelike', categoryB: 'roguelike',  type: 'known',
          });
        }
      });

      r.Inferred_Roguelike_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelikelike', categoryB: 'roguelike',  type: 'inferred',
          });
        }
      });

      r.Inferred_Roguelikelike_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelikelike', categoryB: 'roguelikelike',  type: 'inferred',
          });
        }
      });

      r.Inferred_Other_Influences.forEach(i => {
        if (validYears(r.Name, i)) {
          influences.push({
            titleA: r.Name, titleB: i, yearA: releasedYears[r.Name], yearB: releasedYears[i],
            categoryA: 'roguelikelike', categoryB: 'other',  type: 'inferred',
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