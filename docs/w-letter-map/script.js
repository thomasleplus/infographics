/* global Datamap, d3 */
(() => {
  var meta = {
    doubleU: { label: "“Double U”", color: "#C03A24" },
    doubleV: { label: "“Double V”", color: "#2C6E63" },
    somethingElse: { label: "Its own name", color: "#D69A2D" },
    na: { label: "No native W · other script", color: "#D8CDB0" },
  };

  // each group = a linguistic region:  k=name-type, r=region, w=the word
  var groups = [
    {
      k: "doubleU",
      r: "Anglosphere",
      w: "double-u",
      c: [
        "USA",
        "GBR",
        "IRL",
        "CAN",
        "AUS",
        "NZL",
        "PHL",
        "BLZ",
        "JAM",
        "BHS",
      ],
    },
    {
      k: "doubleU",
      r: "Lusophone world",
      w: "dáblio  (← double-u)",
      c: ["PRT", "BRA", "AGO", "MOZ", "CPV", "GNB", "STP", "TLS"],
    },

    { k: "doubleV", r: "Iberia (Spanish)", w: "uve doble", c: ["ESP"] },
    {
      k: "doubleV",
      r: "Hispanic America",
      w: "doble ve / doble u",
      c: [
        "GTM",
        "HND",
        "SLV",
        "NIC",
        "CRI",
        "PAN",
        "COL",
        "VEN",
        "ECU",
        "PER",
        "BOL",
        "CHL",
        "ARG",
        "URY",
        "PRY",
        "CUB",
        "DOM",
        "PRI",
      ],
    },
    {
      k: "doubleV",
      r: "Francophonie",
      w: "double vé",
      c: [
        "FRA",
        "MCO",
        "HTI",
        "SEN",
        "MLI",
        "NER",
        "BFA",
        "CIV",
        "GIN",
        "TGO",
        "BEN",
        "TCD",
        "CMR",
        "GAB",
        "COG",
        "COD",
        "CAF",
        "MDG",
        "DJI",
      ],
    },
    {
      k: "doubleV",
      r: "Italosphere",
      w: "doppia vu",
      c: ["ITA", "SMR", "VAT"],
    },
    { k: "doubleV", r: "Catalan lands", w: "ve doble", c: ["AND"] },
    { k: "doubleV", r: "Maltese", w: "doppju vu", c: ["MLT"] },
    {
      k: "doubleV",
      r: "Romanian sphere",
      w: "dublu ve",
      c: ["ROU", "MDA"],
    },
    {
      k: "doubleV",
      r: "Central Europe",
      w: "dvojité vé",
      c: ["CZE", "SVK"],
    },
    { k: "doubleV", r: "Central Europe", w: "dupla vé", c: ["HUN"] },
    { k: "doubleV", r: "Nordic", w: "dobbelt-ve", c: ["DNK", "NOR"] },
    { k: "doubleV", r: "Nordic", w: "dubbel-ve", c: ["SWE"] },
    { k: "doubleV", r: "Nordic", w: "kaksois-vee", c: ["FIN"] },
    { k: "doubleV", r: "Nordic", w: "tvöfalt vaff", c: ["ISL"] },
    {
      k: "doubleV",
      r: "Baltic & W. Balkans",
      w: "double V (loanword)",
      c: ["HRV", "SVN", "LTU", "LVA", "EST"],
    },

    {
      k: "somethingElse",
      r: "Germanic core",
      w: "we  (≈ “vé”)",
      c: ["DEU", "AUT", "CHE", "LIE", "LUX"],
    },
    {
      k: "somethingElse",
      r: "Low Countries",
      w: "wee",
      c: ["NLD", "SUR", "BEL"],
    },
    { k: "somethingElse", r: "Polish", w: "wu", c: ["POL"] },
    {
      k: "somethingElse",
      r: "Malay world",
      w: "we",
      c: ["IDN", "MYS", "BRN"],
    },
  ];

  var el = document.getElementById("map");

  if (typeof Datamap === "undefined") {
    el.innerHTML =
      '<div class="loadfail">The map library couldn’t load (it streams from a CDN). ' +
      "If your network blocks external scripts, try opening this file in a regular browser tab.</div>";
    return;
  }

  var data = {};
  groups.forEach((g) => {
    g.c.forEach((code) => {
      data[code] = { fillKey: g.k, word: g.w, region: g.r };
    });
  });

  // Mexico uses BOTH: standard "doble ve" + everyday "doble u" → striped fill
  data.MEX = {
    fillKey: "doubleV",
    mixed: true,
    word: "doble ve  +  doble u",
    region: "Hispanic America",
  };

  var map = new Datamap({
    element: el,
    projection: "equirectangular",
    responsive: true,
    fills: {
      defaultFill: meta.na.color,
      doubleU: meta.doubleU.color,
      doubleV: meta.doubleV.color,
      somethingElse: meta.somethingElse.color,
    },
    data: data,
    geographyConfig: {
      borderColor: "#C3B488",
      borderWidth: 0.25,
      // Custom hover handlers below replace datamaps' built-in, which had
      // issues in Chrome (moveToFront reparenting broke mouseout restore).
      highlightOnHover: false,
      popupOnHover: false,
    },
  });

  var HIGHLIGHT_FILL = "#3A2E1F";
  var HIGHLIGHT_STROKE = "#3A2E1F";
  var HIGHLIGHT_STROKE_WIDTH = 0.6;

  function countryPopup(geo, d) {
    var key = d?.fillKey ? d.fillKey : "na";
    var m = meta[key];
    var word = d?.word ? d.word : "—";
    var region = d?.region ? d.region : "No native W · other script";
    var catRow;
    if (d?.mixed) {
      catRow =
        '<div class="wtip-cat">' +
        '<span class="wdot" style="background:' +
        meta.doubleV.color +
        '"></span>' +
        '<span class="wdot" style="background:' +
        meta.doubleU.color +
        ';margin-left:-3px"></span>' +
        "Both names in use</div>";
    } else {
      catRow =
        '<div class="wtip-cat"><span class="wdot" style="background:' +
        m.color +
        '"></span>' +
        m.label +
        "</div>";
    }
    return (
      '<div class="wtip">' +
      '<div class="wtip-region">' +
      region +
      "</div>" +
      '<div class="wtip-word">' +
      word +
      "</div>" +
      catRow +
      '<div class="wtip-country">' +
      geo.properties.name +
      "</div>" +
      "</div>"
    );
  }

  // --- Stripe Mexico in red + teal to show both names coexist ---
  var defs = map.svg.append("defs");
  var pat = defs
    .append("pattern")
    .attr("id", "mx-stripes")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 9)
    .attr("height", 9)
    .attr("patternTransform", "rotate(45)");
  pat
    .append("rect")
    .attr("width", 9)
    .attr("height", 9)
    .attr("fill", meta.doubleV.color);
  pat
    .append("rect")
    .attr("width", 4.5)
    .attr("height", 9)
    .attr("fill", meta.doubleU.color);
  // set fill via style so the hover save/restore keeps the pattern
  map.svg.selectAll(".MEX").style("fill", "url(#mx-stripes)");

  // Second stripe pattern: teal + gold, for FR-vs-Germanic bilingual regions
  // (Brussels FR/NL, Swiss Fribourg & Valais FR/DE).
  var pat2 = defs
    .append("pattern")
    .attr("id", "dv-se-stripes")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 9)
    .attr("height", 9)
    .attr("patternTransform", "rotate(45)");
  pat2
    .append("rect")
    .attr("width", 9)
    .attr("height", 9)
    .attr("fill", meta.doubleV.color);
  pat2
    .append("rect")
    .attr("width", 4.5)
    .attr("height", 9)
    .attr("fill", meta.somethingElse.color);

  // --- Sub-national splits: overlay real province/canton shapes where a
  // country's language border cuts through it. Canada (Quebec/NB),
  // Belgium (Wallonia/Brussels), Switzerland (Romandie/Ticino/bilingual). ---
  var geoPath = d3.geo.path().projection(map.projection);
  var tip = d3
    .select(el)
    .append("div")
    .attr("class", "hoverinfo subnat-tip")
    .style("position", "absolute")
    .style("display", "none")
    .style("pointer-events", "none");

  map.svg
    .selectAll(".datamaps-subunit")
    .on("mouseover", function (geo) {
      var $this = d3.select(this);
      $this
        .attr("data-orig-fill", $this.style("fill"))
        .attr("data-orig-stroke", $this.style("stroke"))
        .attr("data-orig-stroke-width", $this.style("stroke-width"))
        .style("fill", HIGHLIGHT_FILL)
        .style("stroke", HIGHLIGHT_STROKE)
        .style("stroke-width", HIGHLIGHT_STROKE_WIDTH);
      var pos = d3.mouse(el);
      tip
        .html(countryPopup(geo, data[geo.id]))
        .style("display", "block")
        .style("left", `${pos[0] + 14}px`)
        .style("top", `${pos[1] + 14}px`);
    })
    .on("mousemove", function (geo) {
      var pos = d3.mouse(el);
      tip
        .html(countryPopup(geo, data[geo.id]))
        .style("left", `${pos[0] + 14}px`)
        .style("top", `${pos[1] + 14}px`);
    })
    .on("mouseout", function () {
      var $this = d3.select(this);
      $this
        .style("fill", $this.attr("data-orig-fill"))
        .style("stroke", $this.attr("data-orig-stroke"))
        .style("stroke-width", $this.attr("data-orig-stroke-width"));
      tip.style("display", "none");
    });

  function pname(p) {
    return (
      p.name ||
      p.name_en ||
      p.gn_name ||
      p.woe_name ||
      p.name_local ||
      ""
    )
      .toString()
      .toLowerCase();
  }
  var adminToCode = {
    Canada: "CAN",
    Belgium: "BEL",
    Switzerland: "CHE",
  };
  var isoPrefToCode = { CA: "CAN", BE: "BEL", CH: "CHE" };
  function getCountry(f) {
    var p = f.properties || {};
    var pref;
    if (p.adm0_a3 && classifiers[p.adm0_a3]) return p.adm0_a3;
    if (p.admin && adminToCode[p.admin]) return adminToCode[p.admin];
    if (typeof p.iso_3166_2 === "string") {
      pref = p.iso_3166_2.split("-")[0];
      if (isoPrefToCode[pref]) return isoPrefToCode[pref];
    }
    return null;
  }
  var classifiers = {
    CAN: (p) => {
      var n = pname(p),
        c = (p.postal || p.iso_3166_2 || "").toString().toUpperCase();
      if (
        n.indexOf("quebec") >= 0 ||
        n.indexOf("québec") >= 0 ||
        c.indexOf("QC") >= 0
      )
        return {
          fill: meta.doubleV.color,
          region: "Francophonie · Québec",
          word: "double vé",
          cat: "“Double V”",
          cc: meta.doubleV.color,
        };
      if (
        n.indexOf("new brunswick") >= 0 ||
        n.indexOf("nouveau-brunswick") >= 0 ||
        c.indexOf("NB") >= 0
      )
        return {
          fill: "url(#mx-stripes)",
          region: "New Brunswick (bilingual)",
          word: "double-u + double vé",
          mixed: true,
          mixA: meta.doubleV.color,
          mixB: meta.doubleU.color,
        };
      return null; // rest of Canada keeps the base red
    },
    BEL: (p) => {
      var n = pname(p);
      // Brussels Region: officially bilingual FR/NL
      if (/bruxelles|brussel/.test(n))
        return {
          fill: "url(#dv-se-stripes)",
          region: "Brussels (bilingual FR/NL)",
          word: "double vé + wee",
          mixed: true,
          mixA: meta.doubleV.color,
          mixB: meta.somethingElse.color,
        };
      // Wallonia: French-speaking provinces (Belgian "Luxembourg" is the province,
      // not the country — we already filtered by country=BEL above).
      if (/hainaut|li[èe]ge|namur|luxembourg|wallon/.test(n))
        return {
          fill: meta.doubleV.color,
          region: "Francophonie · Wallonia",
          word: "double vé",
          cat: "“Double V”",
          cc: meta.doubleV.color,
        };
      return null; // Flanders keeps the Low-Countries gold
    },
    CHE: (p) => {
      var n = pname(p),
        c = (p.postal || p.iso_3166_2 || "")
          .toString()
          .toUpperCase()
          .replace("CH-", "");
      // Romandie: French-majority cantons
      if (
        ["GE", "VD", "NE", "JU"].indexOf(c) >= 0 ||
        /gen[èe]ve|geneva|vaud|neuch[âa]tel|^jura$/.test(n)
      )
        return {
          fill: meta.doubleV.color,
          region: "Francophonie · Romandie",
          word: "double vé",
          cat: "“Double V”",
          cc: meta.doubleV.color,
        };
      // Ticino: Italian-speaking — also "double V" category (doppia vu)
      if (c === "TI" || /ticino|tessin/.test(n))
        return {
          fill: meta.doubleV.color,
          region: "Italosphere · Ticino",
          word: "doppia vu",
          cat: "“Double V”",
          cc: meta.doubleV.color,
        };
      // Officially bilingual FR/DE: Fribourg and Valais
      if (
        ["FR", "VS"].indexOf(c) >= 0 ||
        /fribourg|freiburg|valais|wallis/.test(n)
      )
        return {
          fill: "url(#dv-se-stripes)",
          region: "Switzerland (bilingual FR/DE)",
          word: "double vé + we",
          mixed: true,
          mixA: meta.doubleV.color,
          mixB: meta.somethingElse.color,
        };
      return null; // German-speaking cantons keep the Germanic gold
    },
  };
  function subTip(s) {
    var cat = s.mixed
      ? '<div class="wtip-cat"><span class="wdot" style="background:' +
        s.mixA +
        '"></span><span class="wdot" style="background:' +
        s.mixB +
        ';margin-left:-3px"></span>Both names in use</div>'
      : '<div class="wtip-cat"><span class="wdot" style="background:' +
        s.cc +
        '"></span>' +
        s.cat +
        "</div>";
    return (
      '<div class="wtip"><div class="wtip-region">' +
      s.region +
      '</div><div class="wtip-word">' +
      s.word +
      "</div>" +
      cat +
      "</div>"
    );
  }

  d3.json(
    "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_1_states_provinces.geojson",
    (err, geo) => {
      if (err || !geo || !geo.features) return; // base map stays intact on failure
      var feats = [];
      geo.features.forEach((f) => {
        var cc = getCountry(f);
        if (!cc) return;
        var s = classifiers[cc](f.properties || {});
        if (s) {
          f.__style = s;
          feats.push(f);
        }
      });
      var sg = map.svg.append("g").attr("class", "subnational");
      sg.selectAll("path")
        .data(feats)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .style("fill", (d) => d.__style.fill)
        .style("stroke", "#C3B488")
        .style("stroke-width", 0.3)
        .on("mousemove", (d) => {
          var m = d3.mouse(el);
          tip
            .html(subTip(d.__style))
            .style("display", "block")
            .style("left", `${m[0] + 14}px`)
            .style("top", `${m[1] + 14}px`);
        })
        .on("mouseout", () => {
          tip.style("display", "none");
        });
    },
  );

  window.addEventListener("resize", () => {
    if (map?.resize) map.resize();
  });
})();
