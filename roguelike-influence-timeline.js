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

  // Selectively annotate some games
  const notableRoguelikeTitles = [
    'Rogue',
    'Moria',
    'NetHack',
    'Angband',
    'ADOM',
    'DoomRL',
  ];
  const notableRoguelikelikeTitles = [
    'Diablo',
    'Diablo II',
    'Spelunky',
    'The Binding of Isaac',
  ];

  ////////////////////////////////////////////////////////////////////////////////
  // Setup influence arc diagram
  const margin = { left: 30, top: 20, right: 20, bottom: 20 };
  const width = 800 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;
  const axisWidth = 25;

  const timeRange = [new Date('1974-12-31'), new Date('2020-01-01')];
  const timeScale = d3.scaleTime()
    .domain(timeRange)
    .range([0, width]);
  const timeAxisBottom = d3.axisBottom(timeScale)
    .ticks(d3.timeYear.every(5));
  const timeAxisBetween = d3.axisTop(timeScale)
    .ticks(d3.timeYear.every(1))
    .tickSize(height)
    .tickFormat("");

  const roguelikeInfluenceScale = d3.scaleLog()
    .base(10)
    .clamp(true)
    .range([height/3*2, 6]);
  const roguelikelikeInfluenceScale = d3.scaleLog()
    .base(10)
    .clamp(true)
    .range([height-axisWidth, height/3*2+axisWidth*2]);

  const container = d3.select('#influence-timeline div');
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  const frame = svg.append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

  // Divider
  const divider = frame.append('g')
    .attr('class', 'divider')
    .append('line')
      .attr('stroke', '#aaa')
      .attr('stroke-dasharray', 25)
      .attr('x1', -20)
      .attr('y1', height/3*2+axisWidth)
      .attr('x2', width+10)
      .attr('y2', height/3*2+axisWidth);

  frame.append('text')
    .attr('class', 'label')
    .attr('x', 20)
    .attr('y', height/3*2+axisWidth - 10)
    .text('roguelike games');

  frame.append('text')
    .attr('class', 'influence label')
    .attr('text-anchor', 'end')
    .attr('transform', `translate(-10, ${0}) rotate(-90)`)
    .text('— more');

  frame.append('text')
    .attr('class', 'influence label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(-10, ${height/3}) rotate(-90)`)
    .text('influence');

  frame.append('text')
    .attr('class', 'influence label')
    .attr('transform', `translate(-10, ${height/3*2+10}) rotate(-90)`)
    .text('less —');

  frame.append('text')
    .attr('class', 'label')
    .attr('x', 20)
    .attr('y', height/3*2+axisWidth + 16)
    .text('"roguelike-like" games');

  frame.append('text')
    .attr('class', 'influence label')
    .attr('text-anchor', 'end')
    .attr('transform', `translate(-10, ${height/3*2+axisWidth*2-10}) rotate(-90)`)
    .text('— more');

  frame.append('text')
    .attr('class', 'influence label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(-10, ${height/6*5+axisWidth/2}) rotate(-90)`)
    .text('influence');

  frame.append('text')
    .attr('class', 'influence label')
    .attr('transform', `translate(-10, ${height-axisWidth}) rotate(-90)`)
    .text('less —');

  // Year Axis
  const timeAxis = frame.append('g')
    .attr('class', 'influence axis lighter')
    .attr('transform', `translate(0 ${height})`)
    .call(timeAxisBetween);

  const timeAxis1 = frame.append('g')
    .attr('class', 'influence axis')
    .attr('transform', `translate(0 ${height})`)
    .call(timeAxisBottom);

  const timeLabel = frame.append('g')
    .attr('class', 'influence label')
    .attr('transform', `translate(-20 ${height - 6})`)
    .append('text')
    .text('year released');

  function draw (files) {
    return new Promise ( (resolve, reject) => {
      const [
        roguelikeInfluences,
        roguelikelikeInfluences,
        releasedYears,
        influences,
      ] = files;

      ////////////////////////////////////////////////////////////////////////
      // Dots - Roguelike and Roguelike-like Games
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
        return releasedYears[r.Name] !== 1000 && r.influenceCount > 0;
      });
      const validRoguelikelikeInfluences = roguelikelikeInfluences.filter(r => {
        return releasedYears[r.Name] !== 1000 && r.influenceCount > 0;
      });

      roguelikeInfluenceScale.domain([1, d3.extent(roguelikeInfluenceCounts)[1]]);
      roguelikelikeInfluenceScale.domain([5, d3.extent(roguelikelikeInfluenceCounts)[1]]);

      // Influence tick labels - not used
      // const roguelikeInfluenceAxisLeft = d3.axisLeft(roguelikeInfluenceScale)
      //   .ticks(10, d3.format('0'));
      // const roguelikeInfluenceAxisBetween = d3.axisRight(roguelikeInfluenceScale)
      //   .ticks(10)
      //   .tickFormat("")
      //   .tickSize(width);
      // frame.append('g')
      //   .attr('class', 'influence axis')
      //   .call(roguelikeInfluenceAxisLeft);
      // frame.append('g')
      //   .attr('class', 'influence axis lighter')
      //   .call(roguelikeInfluenceAxisBetween);

      // const roguelikelikeInfluenceAxisLeft = d3.axisLeft(roguelikelikeInfluenceScale)
      //   .ticks(10, d3.format('0'));
      // const roguelikelikeInfluenceAxisBetween = d3.axisRight(roguelikelikeInfluenceScale)
      //   .ticks(10)
      //   .tickFormat("")
      //   .tickSize(width);
      // frame.append('g')
      //   .attr('class', 'influence axis')
      //   .call(roguelikelikeInfluenceAxisLeft);
      // frame.append('g')
      //   .attr('class', 'influence axis lighter')
      //   .call(roguelikelikeInfluenceAxisBetween);

      // Draw dots relative to influence, and along the timeline
      const roguelikeDots = frame.append('g')
        .attr('class', 'roguelike games')
        .selectAll('.dot')
        .data(validRoguelikeInfluences)
        .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('stroke', 'transparent')
          .attr('stroke-width', 10)
          .attr('cx', d => timeScale(new Date(d.Released)))
          .attr('cy', d => roguelikeInfluenceScale(d.influenceCount))
          .attr('r', d => 3)
          .on('mousemove', displayTooltip)
          .on('mouseleave', removeTooltip)
          .on('click', selectTitle);

      const roguelikelikeDots = frame.append('g')
        .attr('class', 'roguelikelike games')
        .selectAll('.dot')
        .data(validRoguelikelikeInfluences)
        .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('stroke', 'transparent')
          .attr('stroke-width', 10)
          .attr('cx', d => timeScale(new Date(d.Released)))
          .attr('cy', d => roguelikelikeInfluenceScale(d.influenceCount))
          .attr('r', d => 3)
          .on('mousemove', displayTooltip)
          .on('mouseleave', removeTooltip)
          .on('click', selectTitle);

      function displayTooltip (d) {
        let tooltip = container.select('#timeline-tooltip');
        if (!tooltip.node()) {
          tooltip = container.append('div')
            .attr('id', 'timeline-tooltip')
            .attr('class', 'tooltip smallerer');
        }
        tooltip.html(`
          <em>${d.Name}</em>
        `);
        const tooltipWidth = tooltip.node().getBoundingClientRect().width;
        tooltip.style('position', 'absolute')
          .style('top', `${d3.event.layerY + 3}px`)
          .style('left', `${d3.event.layerX > width/2 ? d3.event.layerX - tooltipWidth - 6 : d3.event.layerX + 6}px`);
      }

      function removeTooltip () {
        container.select('#timeline-tooltip').remove();
      }

      function selectTitle (d) {
        const select = d3.select('#roguelike-timeline-selection');
        select.node().value = d.Name;
        select.dispatch('change');
      }

      // Label games that are notable
      const roguelikeAnnotations = frame.append('g')
        .attr('class', 'label annotation')
        .selectAll('.annotation')
        .data(validRoguelikeInfluences.filter(r => notableRoguelikeTitles.indexOf(r.Name) > -1))
        .enter();

      roguelikeAnnotations.append('text')
          .attr('class', 'annotation')
          .attr('alignment-baseline', 'middle')
          .attr('x', d => timeScale(new Date(d.Released)) + 25)
          .attr('y', d => roguelikeInfluenceScale(d.influenceCount))
          .text(d => d.Name);

      roguelikeAnnotations.append('line')
        .attr('class', 'annotation')
        .attr('x1', d => timeScale(new Date(d.Released)) + 20)
        .attr('y1', d => roguelikeInfluenceScale(d.influenceCount))
        .attr('x2', d => timeScale(new Date(d.Released)) + 8)
        .attr('y2', d => roguelikeInfluenceScale(d.influenceCount));

      const roguelikelikeAnnotations = frame.append('g')
        .attr('class', 'label annotation')
        .selectAll('.annotation')
        .data(validRoguelikelikeInfluences.filter(r => notableRoguelikelikeTitles.indexOf(r.Name) > -1))
        .enter();

      roguelikelikeAnnotations.append('text')
          .attr('class', 'annotation')
          .attr('alignment-baseline', 'middle')
          .attr('x', d => timeScale(new Date(d.Released)) + 25)
          .attr('y', d => roguelikelikeInfluenceScale(d.influenceCount))
          .text(d => d.Name);

      roguelikelikeAnnotations.append('line')
        .attr('class', 'annotation')
        .attr('stroke', 'black')
        .attr('x1', d => timeScale(new Date(d.Released)) + 20)
        .attr('y1', d => roguelikelikeInfluenceScale(d.influenceCount))
        .attr('x2', d => timeScale(new Date(d.Released)) + 8)
        .attr('y2', d => roguelikelikeInfluenceScale(d.influenceCount));


      ////////////////////////////////////////////////////////////////////////
      // Lines - Roguelike and Roguelike-like Influences
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

      const influenceLines = frame.append('g').lower()
        .selectAll('.line')
        .data(validInfluences)
        .enter()
          .append('line')
          .attr('class', 'influence line')
          .attr('opacity', 0.025)
          .attr('stroke-width', d => d.type === 'known' ? 3 : 1.5)
          .attr('x1', d => timeScale(new Date(findTitle(d.titleA).Released)))
          .attr('y1', d => {
            if (d.categoryA === 'roguelike') {
              return roguelikeInfluenceScale(findTitle(d.titleA).influenceCount);
            } else if (d.categoryA === 'roguelikelike') {
              return roguelikelikeInfluenceScale(findTitle(d.titleA).influenceCount);
            }
          })
          .attr('x2', d => timeScale(new Date(findTitle(d.titleB).Released)))
          .attr('y2', d => {
            if (d.categoryB === 'roguelike') {
              return roguelikeInfluenceScale(findTitle(d.titleB).influenceCount);
            } else if (d.categoryB === 'roguelikelike') {
              return roguelikelikeInfluenceScale(findTitle(d.titleB).influenceCount);
            }
          })
        .exit().remove();

      resolve([
        roguelikeInfluences,
        roguelikelikeInfluences,
        validRoguelikeInfluences,
        validRoguelikelikeInfluences,
        validInfluences,
        releasedYears,
        influences,
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
        influences,
      ] = files;

      // Populate the dropdown menu
      const select = d3.select('#roguelike-timeline-selection');
      const hyperlink = d3.select('#roguelike-timeline-infobox [name=roguetemple]');
      const project = d3.select('#roguelike-timeline-infobox [name=project]');
      const theme = d3.select('#roguelike-timeline-infobox [name=theme]');
      const developer = d3.select('#roguelike-timeline-infobox [name=developer]');
      const released = d3.select('#roguelike-timeline-infobox [name=released]');
      const updated = d3.select('#roguelike-timeline-infobox [name=updated]');
      const count = d3.select('#roguelike-timeline-infobox [name=count]');

      validRoguelikelikeInfluences.sort((a, b) => {
        if (a.Name < b.Name) return -1;
        else if (a.Name > b.Name) return 1;
        return 0;
      });

      select.append('option')
        .attr('value', '')
        .text(`=== Roguelike games ===`);
      validRoguelikeInfluences.forEach(r => {
        const year = releasedYears[r.Name];
        const option = select.append('option')
          .attr('value', r.Name)
          .text(`${r.Name} (${year})`);
        // Default selection on load
        if (r.Name === 'Dungeons of Dredmor') {
          option.attr('selected', true);
        }
      });
      select.append('option')
        .attr('value', '')
        .text(`=== "Roguelike-like" games ===`);
      validRoguelikelikeInfluences.forEach(r => {
        const year = releasedYears[r.Name];
        const option = select.append('option')
          .attr('value', r.Name)
          .text(`${r.Name} (${year})`);
      });

      // Display influence lines on selection
      select.on('change', drawGameInfluence);

      function drawGameInfluence () {
        const title = d3.event.target.value;
        if (title === '') {
          return;
        }
        const knownTitles = d3.select('#roguelike-timeline-known');
        const inferredTitles = d3.select('#roguelike-timeline-inferred');
        const data = validInfluences.filter(r => r.titleA === title || r.titleB === title);
        const datum = findTitle(title);
        const relatedInfluences = filterByName(influences, title);
        const influenceCount = relatedInfluences.length;
        const knownInfluenceCount = filterKnown(relatedInfluences).length;

        // Display metadata
        hyperlink.html('Title: ');
        hyperlink.append('a')
          .attr('href', datum['RogueTemple'] || "#")
          .attr('target', '_blank')
          .text(datum['RogueTemple'] ? title : "N/A");

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

        frame.selectAll('.active').remove();
        const activeInfluences = frame.append('g').lower()
          .attr('class', 'active')
          .selectAll('active')
          .data(data)
          .enter()
            .append('line')
            .attr('class', 'influence active line')
            .attr('opacity', 0.75)
            .attr('stroke-width', d => d.type === 'known' ? 2 : 1)
            .attr('x1', d => timeScale(new Date(findTitle(d.titleA).Released)))
            .attr('y1', d => {
              if (d.categoryA === 'roguelike') {
                return roguelikeInfluenceScale(findTitle(d.titleA).influenceCount);
              } else if (d.categoryA === 'roguelikelike') {
                return roguelikelikeInfluenceScale(findTitle(d.titleA).influenceCount);
              }
            })
            .attr('x2', d => timeScale(new Date(findTitle(d.titleB).Released)))
            .attr('y2', d => {
              if (d.categoryB === 'roguelike') {
                return roguelikeInfluenceScale(findTitle(d.titleB).influenceCount);
              } else if (d.categoryB === 'roguelikelike') {
                return roguelikelikeInfluenceScale(findTitle(d.titleB).influenceCount);
              }
            })
          .exit().remove();

        // Display connectded titles
        const knownInfluences = data.filter(r => r.type === 'known')
          .map(r => identifyOther(r, title))
          .filter(onlyUnique);
        const inferredInfluences = data.filter(r => r.type === 'inferred')
          .map(r => identifyOther(r, title))
          .filter(onlyUnique);

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

        // Display active title
        const activeTitle = findTitle(title);
        const x = timeScale(new Date(activeTitle.Released));
        const activeAnnotations = frame.append('g')
          .attr('class', 'active');

        frame.append('circle')
          .attr('class', 'active annotation')
          .attr('opacity', 0.75)
          .attr('fill', (activeTitle.type === 'roguelike'
            ? 'rgb(79,74,138)'
            : 'rgb(91,122,175)'
          ))
          .attr('cx', timeScale(new Date(activeTitle.Released)))
          .attr('cy', (activeTitle.type === 'roguelike'
            ? roguelikeInfluenceScale(activeTitle.influenceCount)
            : roguelikelikeInfluenceScale(activeTitle.influenceCount)
          ))
          .attr('r', 9).lower();

        if (notableRoguelikeTitles.indexOf(title) > -1 || notableRoguelikelikeTitles.indexOf(title) > -1) {
          return;
        }

        activeAnnotations.append('text')
          .attr('class', 'annotation')
          .attr('alignment-baseline', 'middle')
          .attr('text-anchor', x > width / 2 ? 'end' : 'start')
          .attr('x', x > width / 2 ? x - 25 : x + 25)
          .attr('y', (activeTitle.type === 'roguelike'
            ? roguelikeInfluenceScale(activeTitle.influenceCount)
            : roguelikelikeInfluenceScale(activeTitle.influenceCount)
          ))
          .text(activeTitle.Name);

        activeAnnotations.append('line')
          .attr('class', 'annotation')
          .attr('stroke', 'black')
          .attr('x1', x > width / 2 ? x - 20 : x + 20)
          .attr('y1', (activeTitle.type === 'roguelike'
            ? roguelikeInfluenceScale(activeTitle.influenceCount)
            : roguelikelikeInfluenceScale(activeTitle.influenceCount)
          ))
          .attr('x2', x > width / 2 ? x - 3 : x + 3)
          .attr('y2', (activeTitle.type === 'roguelike'
            ? roguelikeInfluenceScale(activeTitle.influenceCount)
            : roguelikelikeInfluenceScale(activeTitle.influenceCount)
          ));
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

      function identifyOther (influence, title) {
        if (influence.titleA === title) {
          return influence.titleB;
        }
        return influence.titleA;
      }

      // Prepare the data source for download
      const data = validRoguelikeInfluences.concat(validRoguelikelikeInfluences);
      const download = {metadata: roguelike_universe_metadata, data: data};
      const blob = new Blob([JSON.stringify(download, null, 2)], {type: 'application/json'});
      const download_url = URL.createObjectURL(blob);
      document.querySelector('#roguelike-timeline-data').href = download_url;

      resolve(files);
    });
  }

})();