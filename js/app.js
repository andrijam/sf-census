var width = 750,
    height = 750;

var svg = d3.select("#map_container").append("svg")
    .attr("width", width)
    .attr("height", height);

var tiler = d3.geo.tile()
    .size([width, height]);

var projection = d3.geo.mercator()
    .center([-122.433701, 37.767683])
    //.scale((1 << 20) / 2 / Math.PI)
    .scale(250000)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

svg
    .call(renderTiles, "highroad")
    .call(renderNeighborhoods);

function renderNeighborhoods(){
  d3.json("data/sf-neighborhoods.json", function(error, sf) {
    if (error) return console.error(error);

    var sfneighborhoods = topojson.feature(sf, sf.objects.SFFind_Neighborhoods);

    svg.append("path")
        .datum(sfneighborhoods)
        .attr("d", path);

    svg.selectAll(".neighborhood")
          .data(topojson.feature(sf, sf.objects.SFFind_Neighborhoods).features)
        .enter().append("path")
          .attr("class", "neighborhood")
          .on("mouseover", function(d) { return setTitle(d.properties.name); })
          //.attr("data-name", function(d) { return d.properties.name; })
          .attr("d", path)
          .attr("fill", "#fff")
          .attr("stroke", "#000")
          .append("svg:title")
          .text( function(d) { return d.properties.name; });

  });
}

function renderTiles(svg, type) {
  svg.append("g")
      .attr("class", type)
    .selectAll("g")
      .data(tiler
        .scale(projection.scale() * 2 * Math.PI)
        .translate(projection([0, 0])))
    .enter().append("g")
      .each(function(d) {
        var g = d3.select(this);
        d3.json("http://" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + ".tile.openstreetmap.us/vectiles-" + type + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".json", function(error, json) {
          g.selectAll("path")
              .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
            .enter().append("path")
              .attr("class", function(d) { return d.properties.kind; })
              .attr("d", path);
        });
      });
}

function setTitle(newTitle){
  d3.select("#selected-title").text(newTitle);
}
