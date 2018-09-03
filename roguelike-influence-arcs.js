// Roguelike Universe data visualisation
// Author: Xavier Ho <contact@xavierho.com>

;(function () {
  ////////////////////////////////////////////////////////////////////////////////
  // Download data
  Promise.all([
    d3.csv('data/roguelike-influence.csv'),
    d3.csv('data/roguelikelike-influence.csv'),
    d3.json('data/games-influence.json'),
  ]).then(gatherInfluence)
    .then(draw)
    .then(setupUI)
    .catch(console.error);

  ////////////////////////////////////////////////////////////////////////////////
  // Setup influence arc diagram
  const margin = { left: 20, top: 20, right: 20, bottom: 20 };
  const width = 800 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;
  const axisWidth = 25;
  let firstLoading = true;

  const timeRange = [new Date('1969-12-31'), new Date('2020-01-01')];
  const timeScale = d3.scaleTime()
    .domain(timeRange)
    .range([0, width]);
  const timeAxisBottom = d3.axisBottom(timeScale)
    .ticks(d3.timeYear.every(5));
  const timeAxisTop = d3.axisTop(timeScale)
    .ticks(d3.timeYear.every(5))
    .tickFormat("");
  const timeAxisBetween = d3.axisBottom(timeScale)
    .ticks(d3.timeYear.every(1).filter(d => d.getYear() % 5 !== 0))
    .tickSize(axisWidth)
    .tickFormat("");

  const container = d3.select('#influence-arcs div')
    .style('position', 'relative');
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  const frame = svg.append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

  // Year Axis
  const timeAxis = frame.append('g')
    .attr('class', 'influence axis lighter')
    .attr('transform', `translate(0 ${height/2})`)
    .call(timeAxisBetween);

  const timeAxis1 = frame.append('g')
    .attr('class', 'influence axis')
    .attr('transform', `translate(0 ${height/2})`)
    .call(timeAxisBottom);

  const timeAxis2 = frame.append('g')
    .attr('class', 'influence axis')
    .attr('transform', `translate(0 ${height/2+axisWidth})`)
    .call(timeAxisTop);

  const timeLabel = frame.append('g')
    .attr('class', 'influence label')
    .attr('transform', `translate(-20 ${height/2-6})`)
    .append('text')
    .text('year released');

  // Labels
  const labels = frame.append('g')
    .attr('class', 'influence label lighter');
  labels.append('text')
    .text('influences in roguelikes games')
    .attr('x', -20)
    .attr('y', height/2-50);
  labels.append('text')
    .text('influences in other genres')
    .attr('x', -20)
    .attr('y', height/2+50+axisWidth)

  // Legends
  const legends = frame.append('g')
    .attr('class', 'influence legend')
    .attr('transform', 'translate(0 80)');
  legends.append('line')
    .attr('class', 'line')
    .attr('stroke-width', 3)
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 30)
    .attr('y2', 0);
  legends.append('line')
    .attr('class', 'line')
    .attr('stroke-width', 1)
    .attr('x1', 0)
    .attr('y1', 16)
    .attr('x2', 30)
    .attr('y2', 16);
  legends.append('text')
    .text('known influence')
    .attr('alignment-baseline', 'middle')
    .attr('x', 36)
    .attr('y', 0);
  legends.append('text')
    .text('inferred influence')
    .attr('alignment-baseline', 'middle')
    .attr('x', 36)
    .attr('y', 16);

  //////////////////////////////////////////////////////////////////////////////
  // After the data is loaded, draw influence arcs
  function draw (files) {
    return new Promise ( (resolve, reject) => {
      const [
        roguelikeInfluences,
        roguelikelikeInfluences,
        releasedYears,
        influences
      ] = files;

      const data = filterRoguelike(influences);

      let roguelikeInfluenceCounts = [];
      let roguelikelikeInfluenceCounts = [];

      roguelikeInfluences.forEach(r => {
        const title = r.Name;
        const year = releasedYears[title];
        const relatedInfluences = filterByName(influences, title);
        roguelikeInfluenceCounts.push(relatedInfluences.length);
        r.type = 'roguelike';
        r.influenceCount = relatedInfluences.length;
      });

      roguelikelikeInfluences.forEach(r => {
        const title = r.Name;
        const year = releasedYears[title];
        const relatedInfluences = filterByName(influences, title);
        roguelikelikeInfluenceCounts.push(relatedInfluences.length);
        r.type = 'roguelikelike';
        r.influenceCount = relatedInfluences.length;
      });

      const validRoguelikeInfluences = roguelikeInfluences.filter(r => {
        return releasedYears[r.Name] !== 1000;
      });
      const validRoguelikelikeInfluences = roguelikelikeInfluences.filter(r => {
        return releasedYears[r.Name] !== 1000;
      });

      const validInfluences = influences.filter(r => {
        const A = findTitle(r.titleA);
        const B = findTitle(r.titleB);
        return (r.categoryB === 'roguelike' || r.categoryB === 'roguelikelike')
            && A !== undefined && A.influenceCount > 0
            && B !== undefined && B.influenceCount > 0;
      });

      function findTitle (title) {
        const r = validRoguelikeInfluences.filter(r => r.Name === title);
        if (r.length === 1) {
          return r[0]
        }

        const ri = validRoguelikelikeInfluences.filter(r => r.Name === title);
        if (ri.length === 1) {
          return ri[0];
        }
      }

      // Draw the arcs
      const roguelikeInfluenceInGenre = frame.append('g')
        .attr('class', 'roguelike in-genre influence')
        .selectAll('.arc')
        .data(data)
        .enter()
          .append('path')
          .attr('transform', d => {
            if (d.categoryB === 'roguelike') {
              return `translate(${positionArc(d)} ${height/2})`;
            } else {
              return `translate(${positionArc(d)} ${height/2+axisWidth}) rotate(180)`;
            }
          })
          .attr('class', 'arc')
          .attr('opacity', d => d.categoryB === 'roguelike' ? 0.0125 : 0.025)
          .attr('d', influenceArc)
        .exit().remove();

      // Prepare the data source for download
      const download = {metadata: roguelike_universe_metadata, data: data};
      const blob = new Blob([JSON.stringify(download, null, 2)], {type: 'application/json'});
      const download_url = URL.createObjectURL(blob);
      document.querySelector('#roguelike-arc-data').href = download_url;

      resolve([
        roguelikeInfluences,
        roguelikelikeInfluences,
        validRoguelikeInfluences,
        validRoguelikelikeInfluences,
        validInfluences,
        releasedYears,
        influences
      ]);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Setup user interface
  function setupUI (files) {
    return new Promise ( (resolve, reject) => {
      const [
        roguelikeInfluences,
        roguelikelikeInfluences,
        validRoguelikeInfluences,
        validRoguelikelikeInfluences,
        validInfluences,
        releasedYears,
        influences
      ] = files;

      // Populate the dropdown menu
      const select = d3.select('#roguelike-arc-selection');
      const hyperlink = d3.select('#roguelike-arc-infobox [name=roguetemple]');
      const contribute = d3.select('#roguelike-arc-contribute');
      const share = d3.select('#roguelike-arc-share');
      const project = d3.select('#roguelike-arc-infobox [name=project]');
      const theme = d3.select('#roguelike-arc-infobox [name=theme]');
      const developer = d3.select('#roguelike-arc-infobox [name=developer]');
      const released = d3.select('#roguelike-arc-infobox [name=released]');
      const updated = d3.select('#roguelike-arc-infobox [name=updated]');
      const count = d3.select('#roguelike-arc-infobox [name=count]');

      // Populate the inferred and known connections
      const knownTitles = d3.select('#roguelike-arc-known');
      const inferredTitles = d3.select('#roguelike-arc-inferred');

      // We need to filter so if the title is a roguelike-like, go back to
      // NetHack as roguelike-likes are not available for this chart.
      const roguelikelikeTitles = new Set(roguelikelikeInfluences.map(r => r.Name));

      const hashTitle = decodeURIComponent(window.location.hash).substring(1); // Remove the #
      roguelikeInfluences.forEach( r => {
        const year = releasedYears[r.Name];

        if (year !== 1000) {
          const option = select.append('option')
            .attr('value', r.Name)
            .text(`${r.Name} (${year})`);
          // Default selection on load, but don't load roguelike-likes as they are not available for this chart
          if (hashTitle !== '' && r.Name === hashTitle) {
            option.attr('selected', true);
          } else if ((hashTitle === '' || roguelikelikeTitles.has(hashTitle)) && r.Name === 'Paper Dungeons Crawler') {
            option.attr('selected', true);
          }
        }

      });

      // Display influence arcs on selection
      select.on('change', drawGameInfluence);

      function drawGameInfluence () {
        const title = d3.event.target.value
        const year = releasedYears[title];
        const x = timeScale(new Date(`${year}-01-01`));
        const data = validInfluences.filter(r => r.titleA === title || r.titleB === title);
        const datum = roguelikeInfluences.filter(r => r.Name === title)[0];
        const relatedInfluences = filterByName(influences, title);
        const influenceCount = relatedInfluences.length;
        const knownInfluenceCount = filterKnown(relatedInfluences).length;

        // Display metadata
        hyperlink.html('');
        hyperlink.append('strong')
          .text(title);
        hyperlink.append('a')
          .attr('class', 'small ml1')
          .attr('href', datum['RogueTemple'] || "#")
          .attr('target', '_blank')
          .text(datum['RogueTemple'] ? '(data source)' : '');

        contribute.attr('href', datum['RogueTemple'] || "#")
          .text(`link to the ${title} entry`);

        project.html('Project page: ');
        project.append('a')
          .attr('href', datum['Link'] || "#")
          .attr('target', '_blank')
          .text(datum['Link'] || "N/A");

        theme.text(`Theme: ${datum['Theme'] || 'N/A'}`)
          .attr('title', datum['Theme'] || 'N/A');
        developer.text(`Developer: ${datum['Developer'] || 'N/A'}`)
          .attr('title', datum['Developer'] || 'N/A');
        released.text(`Initial release: ${datum['Released'] || 'N/A'}`)
          .attr('title', datum['Released'] || 'N/A');
        updated.text(`Most recent update: ${datum['Updated'] || 'N/A'}`)
          .attr('title', datum['Updated'] || 'N/A');
        count.text(`Estimated influence: ${influenceCount > 1 ? influenceCount + ' games' : influenceCount + ' game'} (${knownInfluenceCount} known)`)
          .attr('title', `${influenceCount} (${knownInfluenceCount} known)`);

        // Display connectded titles
        const knownInfluences = data.filter(r => r.type === 'known')
          .map(r => identifyOther(r, title))
          .filter(onlyUnique);
        const inferredInfluences = data.filter(r => r.type === 'inferred')
          .map(r => identifyOther(r, title))
          .filter(onlyUnique);

        console.log(title, data);

        if (knownInfluences.length > 0) {
          knownTitles.html('Known influences: ');
          const knownList = knownTitles.selectAll('.list')
            .data(knownInfluences)
            .enter();
          knownList.append('a')
            .attr('class', 'list mr1')
            .attr('href', "#")
            .text(d => d)
            .on('click', d => {
              select.property('value', d);
              select.dispatch('change');
              d3.event.preventDefault();
              return false;
            })
            .exit().remove();
        } else {
          knownTitles.html('');
        }

        if (inferredInfluences.length > 0) {
          inferredTitles.html('Inferred influences: ');
          const inferredList = inferredTitles.selectAll('.list')
            .data(inferredInfluences)
            .enter();
          inferredList.append('a')
            .attr('class', 'list mr1')
            .attr('href', "#")
            .text(d => d)
            .on('click', d => {
              select.property('value', d);
              select.dispatch('change');
              d3.event.preventDefault();
              return false;
            })
            .exit().remove();
        } else {
          inferredTitles.html('');
        }

        // Update hash fragment for sharing
        if (!firstLoading) {
          window.location.hash = title;
        }

        // Update share link
        share.attr('href', window.location);

        // Remove previous selection
        frame.selectAll('.active').remove();

        // Draw current selection
        const active = frame.append('g')
          .attr('class', 'active')

        active.append('line')
          .attr('stroke', 'black')
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', 10)
          .attr('x1', x)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', height);

        active.append('text')
          .attr('x', () => x > width/2 ? -6 + x : 6 + x)
          .attr('y', 8)
          .style('font-weight', 500)
          .attr('text-anchor', () => x > width/2 ? 'end' : 'start')
          .text(`${title} (${year})`);

        active.selectAll('.arc')
          .data(filterByName(influences, title))
          .enter()
            .append('path')
            .attr('class', 'arc')
            .attr('transform', d => {
              if (d.categoryB === 'roguelike') {
                return `translate(${positionArc(d)} ${height/2})`;
              } else {
                return `translate(${positionArc(d)} ${height/2+axisWidth}) rotate(180)`;
              }
            })
            .attr('opacity', 1)
            .attr('stroke', 'transparent')
            .attr('stroke-width', 10)
            .attr('d', influenceArc)
            .on('mousemove', displayTooltip)
            .on('mouseout', removeTooltip)
            .on('focus', displayTooltip)
            .on('blur', removeTooltip)
          .exit().remove();

        // Update the description text
        const descriptionText = d3.select('#genre-influential-text');
        const descriptionType = calculateInfluenceType(title);

        let influentialText,
            genreText;
        if (!descriptionType.influential && !descriptionType.representative) {
          influentialText = 'neither more influential or representative';
        } else if (descriptionType.influential) {
          influentialText = 'more influential';
        } else if (descriptionType.representative) {
          influentialText = 'more representative';
        }
        if (!descriptionType.inGenre && !descriptionType.outOfGenre) {
          genreText = 'all of its related';
        } else if (descriptionType.inGenre) {
          genreText = 'other roguelike';
        } else if (descriptionType.outOfGenre) {
          genreText = 'other non-roguelike';
        }
        descriptionText.html(`given the data we can say <span>${title}</span> is <span>${influentialText}</span> for <span>${genreText}</span> games.`);
      }
      select.dispatch('change');

      function findTitle (title) {
        const r = validRoguelikeInfluences.filter(r => r.Name === title);
        if (r.length === 1) {
          return r[0]
        }

        const ri = validRoguelikelikeInfluences.filter(r => r.Name === title);
        if (ri.length === 1) {
          return ri[0];
        }
      }


      function calculateInfluenceType (title) {
        const result = {influential: false, representative: false, inGenre: false, outOfGenre: false};
        const counts = {influential: 0, representative: 0, inGenre: 0, outOfGenre: 0};
        influences.filter(r => r.titleA === title).forEach(r => {
          if (r.yearB > r.yearA) {
            counts.influential += 1;
          } else if (r.yearB < r.yearA) {
            counts.representative += 1;
          }

          if (r.categoryB === 'roguelike') {
            counts.inGenre += 1;
          } else {
            counts.outOfGenre += 1;
          }
        });
        influences.filter(r => r.titleB === title).forEach(r => {
          if (r.yearA > r.yearB) {
            counts.influential += 1;
          } else if (r.yearA < r.yearB) {
            counts.representative += 1;
          }

          if (r.categoryA === 'roguelike') {
            counts.inGenre += 1;
          } else {
            counts.outOfGenre += 1;
          }
        });
        result.influential = counts.influential > counts.representative + 1;
        result.representative = counts.representative > counts.influential + 1;
        result.inGenre = counts.inGenre > counts.outOfGenre + 1;
        result.outOfGenre = counts.outOfGenre > counts.inGenre + 1;
        return result;
      }

      function displayTooltip (d) {
        let tooltip = container.select('#arc-tooltip');
        if (!tooltip.node()) {
          tooltip = container.append('div')
            .attr('id', 'arc-tooltip')
            .attr('class', 'tooltip smallerer');
        }
        tooltip.html(`
          <em>${d.type}</em> influence<br>
          ${d.titleA} (${d.yearA}) - ${d.categoryA}</em><br>
          ${d.titleB} (${d.yearB}) - ${d.categoryB}</em><br>
        `);
        const tooltipWidth = tooltip.node().getBoundingClientRect().width;
        tooltip.style('position', 'absolute')
          .style('top', `${d3.event.layerY + 3}px`)
          .style('left', `${d3.event.layerX > width/2 ? d3.event.layerX - tooltipWidth - 6 : d3.event.layerX + 6}px`);
      }

      function removeTooltip () {
        container.select('#arc-tooltip').remove();
      }

      firstLoading = false;

      resolve(files);
    });
  }

  function influenceArc (d) {
    const minYear = Math.min(d.yearA, d.yearB);
    const maxYear = Math.max(d.yearA, d.yearB);
    const yearA = new Date(`${minYear}-01-01`);
    const yearB = new Date(`${maxYear}-01-01`);
    const pointA = timeScale(yearA);
    const pointB = timeScale(yearB);
    let outerRadius = Math.ceil((pointB - pointA) / 2);
    let innerRadius = Math.ceil((pointB - pointA) / 2 - 0.5);

    if (d.type === 'known') {
      outerRadius += 1.5;
      innerRadius -= 1.5;
    }

    return d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)();
  };

  function positionArc (d) {
    const minYear = Math.min(d.yearA, d.yearB);
    const maxYear = Math.max(d.yearA, d.yearB);
    const yearA = new Date(`${minYear}-01-01`);
    const yearB = new Date(`${maxYear}-01-01`);
    const pointA = timeScale(yearA);
    const pointB = timeScale(yearB);
    return (pointA + pointB) / 2;
  }

  function identifyOther (influence, title) {
    if (influence.titleA === title) {
      return influence.titleB;
    }
    return influence.titleA;
  }

})();