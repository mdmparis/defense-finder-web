// Operon viewer part...

var view_width = 0;
var fontsize = 0;
var arrowheight = 0;
var arrowpoint = 0;
var scroll_width = 0;

var mo_x_off = 5;
var mo_y_off = 100;

function calcsizes() {
  view_width = document.getElementById("operon_viewer").clientWidth; //d3.select("div#operon_viewer").node().getBoundingClientRect().width; // make this scale with the div container?
  scroll_width = view_width / 4;
  fontsize = 12; //view_width / 120;
  arrowheight = 28; // view_width / 60;
  arrowpoint = 12; //fontsize / 2;
}

function get_orf_shape(arrowpoint, arrowheight) {
  return {
    plus: function (width) {
      var points = [
        [0, 0],
        [width - arrowpoint, 0],
        [width, arrowheight / 2],
        [width - arrowpoint, arrowheight],
        [0, arrowheight],
        [0, 0],
      ];
      return d3.line()(points);
    },
    minus: function (width) {
      var points = [
        [0, arrowheight / 2],
        [arrowpoint, 0],
        [width, 0],
        [width, arrowheight],
        [arrowpoint, arrowheight],
        [0, arrowheight * 0.5],
      ];
      return d3.line()(points);
    },
  };
}

function set_orf_font(_width, fontsize) {
  //	if (width < 80) // magic number! FIXME
  //		fontsize = 10;
  return fontsize + "pt sans";
}

function reset_orf_font(bb, width, _fontsize) {
  if (width - 15 < bb.width) return 10 + "pt sans";
  return 12 + "pt sans";
}

function ellipse_orf_text(bb, width, text) {
  if (width < bb.width) return "...";
  return text;
}

calcsizes();

//var view_width = 1500;
var view_x = 0;
var view_y = 0;

var offset_x = 50;
var offset_y = 70;

//- gene details div
var div = d3
  .select("div#operon_viewer")
  .append("div")
  .attr("class", "hit_details")
  .style("opacity", 0);

var view_height = 0;

var non_scrolling = d3
  .select("div#operon_viewer")
  .append("svg")
  .attr("id", "main")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .style("cursor", "grab")
  .classed("svg-content-responsive", true);

var scroll_bar, scroll_barB;
var non_scrolling_back, clip_rect, scroll_group, scroll_rect, content_group;
var total_content_width = 0;
var orf_shape;
var scrollDistance = 0;
var scrollWidth = 0;
var content_box = 0;
var xScale;

d3.tsv(
  "/static/results/tsv/68af4c71e8da7ff5348a5fdb07d2259ef6547336f5e76b7f35b56f8df39ecb5e_operon.tsv"
).then(function (data) {
  // format the data
  data.forEach(function (d) {
    d.start = +d.start;
    d.end = +d.end;
    d.y_offset = +d.y_offset;
    d.text_offset = +d.text_offset;
  });

  //- set the height based on how many loci are to be displayed
  data.filter(function (d) {
    return d.draw == "line";
  }).length;
  view_height =
    data.filter(function (d) {
      return d.draw == "line";
    }).length *
      125 +
    70 +
    view_y;
  non_scrolling.attr("viewBox", "0 0 " + view_width + " " + view_height);

  //- use a scale for the x axis
  xScale = d3.scaleLinear().domain([0, 8000]).range([0, 2000]);

  //- background - shows the defined viewBox
  non_scrolling_back = non_scrolling
    .append("rect")
    .attr("x", view_x)
    .attr("y", view_y)
    //.attr('rx', 10)
    .attr("width", view_width)
    .attr("height", view_height)
    .attr("fill", "#F9F9F9")
    .attr("stroke", "#C2C2C2")
    .attr("shape-rendering", "crisprEdges")
    .attr("stroke-width", "2");

  var clip_path = non_scrolling
    .append("clipPath")
    .attr("id", "scrollbox-clip-path");

  clip_rect = clip_path
    .append("rect")
    .attr("x", view_x)
    .attr("y", view_y)
    .attr("width", view_width)
    .attr("height", view_height);

  scroll_group = non_scrolling
    .append("g")
    .attr("id", "scroll_group")
    .attr("x", view_x)
    .attr("y", view_y)
    .attr("width", view_width)
    .attr("height", view_height)
    .style("cursor", "grab")
    .attr("clip-path", "url(#scrollbox-clip-path)");

  scroll_rect = scroll_group
    .append("rect")
    .attr("x", view_x)
    .attr("y", view_y)
    .attr("width", view_width)
    .attr("height", view_height)
    .style("cursor", "grab")
    .attr("opacity", 0);

  content_group = scroll_group
    .append("g")
    .attr(
      "transform",
      "translate(" + offset_x + "," + (view_y + offset_y) + ")"
    );

  //-- operon plots --

  //- text for locus headings - add to non_scrolling so the text doesn't scroll
  non_scrolling
    .selectAll("text.heading")
    .data(data)
    .enter()
    .append("svg:text")
    .filter(function (d) {
      return d.draw == "line";
    })
    .style("font", fontsize * 1.2 + "px sans")
    .attr("x", 20)
    .attr("y", function (d) {
      return d.y_offset - arrowheight - 20 + offset_y;
    })
    .attr("font-family", "sans-serif")
    .text(function (d) {
      return [d.text];
    });

  //- draw the orfs
  orf_shape = get_orf_shape(arrowpoint, arrowheight);

  content_group
    .selectAll("path")
    .data(data)
    .enter()
    .append("svg:path")
    .filter(function (d) {
      return d.draw == "orf";
    })
    .attr("d", function (d) {
      return orf_shape[d.strand](xScale(d.end - d.start));
    })
    .attr("stroke", function (d) {
      return d.stroke;
    })
    .attr("stroke-width", 2)
    .attr("fill", function (d) {
      return d.fill;
    })
    .attr("transform", function (d) {
      return "translate(" + xScale(d.start) + "," + d.y_offset + ")";
    });

  //- text for orfs
  content_group
    .selectAll("text.orf")
    .data(data)
    .enter()
    .append("svg:text")
    .filter(function (d) {
      return d.draw == "orf";
    })
    .attr("class", "orf")
    .attr("x", function (d) {
      return xScale(d.start + (d.end - d.start) / 2);
    }) // use align center instead?
    .attr("y", function (d) {
      return d.y_offset + arrowheight / 2;
    })
    .style("font", function (d) {
      return set_orf_font(xScale(d.end - d.start), fontsize);
    })
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .text(function (d) {
      return [d.text];
    })
    .on("mouseover", function (d) {
      div.style("opacity", 0.95);
      div.raise();
      div
        .html(
          "<strong>PADLOC details:</strong>" +
            "<br>Protein:  " +
            d.text +
            "<br>System:  " +
            d.system +
            "<br>Locus tag: " +
            d.locus_tag +
            "<br>Description:  " +
            d.description +
            "<br>HMM:  " +
            d.hmm_name +
            "<br>HMM coverage:  " +
            d.hmm_coverage +
            "<br>Target coverage:  " +
            d.target_coverage +
            "<br>Score:  " +
            d.score
        )
        //.style("left", (d3.event.pageX - mo_x_off) + "px")
        .style(
          "left",
          d3.select(this).attr("x") - mo_x_off - scrollDistance > 25
            ? d3.select(this).attr("x") - mo_x_off - scrollDistance + "px"
            : "25px"
        )
        //.style("top", (d3.event.pageY) + "px");
        .style(
          "top",
          d3.select("div#operon_viewer").node().getBoundingClientRect().y +
            d3.select(this).node().getBBox().y +
            window.scrollY +
            mo_y_off +
            "px"
        );
      //.style("top", function(d) { console.log(d3.select(this).attr("y")); return (d3.select(this).attr("y")) +  "px";});
    })
    .on("mouseout", function (_d) {
      div.style("opacity", 0);
    });

  //- add axes for the genome position (find non-loop way of doing this??)
  var axes = data.filter(function (d) {
    return d.draw == "line";
  });

  for (locus in axes) {
    content_group
      .append("g")
      .attr("transform", function () {
        return "translate(0," + (axes[locus].y_offset + arrowheight / 2) + ")";
      })
      .call(
        d3
          .axisTop(
            d3
              .scaleLinear()
              .domain([axes[locus].start, axes[locus].end])
              .range([0, xScale(axes[locus].end - axes[locus].start)])
          )
          .tickSize(arrowheight, 0)
          .ticks((axes[locus].end - axes[locus].start) / 1000)
          .tickSizeOuter(arrowheight / 3, 0)
        //.tickFormat(function (d) {return ( d + " kb");})
      )
      .style("font", fontsize * 0.8 + "px sans")
      .lower();
  }

  //- end operon plots

  //- zoom x scale

  //const zoom_plus = non_scrolling.append('rect')
  //	    .attr("height", 40)
  //		.attr("width", 40)
  //		.attr("rx", 10)
  //		.attr("fill", "black")
  //		.attr("transform", `translate(${view_x + 10},${view_height - 70} )`)
  //		.on("click", () => {zoom(500)});

  //const zoom_minus = non_scrolling.append('rect')
  //	    .attr("height", 40)
  //		.attr("width", 40)
  //		.attr("rx", 10)
  //		.attr("fill", "black")
  //		.attr("transform", `translate(${view_x + 60},${view_height - 70} )`)
  //		.on("click", () => {zoom(-500)});;

  //function zoom(zoom_change) {
  //console.log( zoom_change)
  //console.log( xScale.range())
  //xScale.range([0,500])
  //- now update the proterties of all x-scaled objects?
  // - just the scrolling group?
  //}

  //- scrolling function
  //- adapted from https://codepen.io/dabrorius/details/EdQoYe

  scroll_bar = non_scrolling
    .append("rect")
    .attr("height", 20)
    .attr("rx", 10)
    .attr("transform", `translate(${view_x},${view_height - 20} )`);

  scroll_barB = non_scrolling
    .append("rect")
    .attr("height", 20)
    .attr("rx", 10)
    .attr("transform", `translate(${view_x},0 )`);

  // Calculate maximum scrollable amount
  content_box = content_group.node().getBBox(); // this returns the dimensions of the content canvas
  total_content_width = Math.max(content_box.x + content_box.width, view_width);
  maxScroll = Math.max(total_content_width - view_width + offset_x * 3, 0); // can only scroll to the end of the content and can't go less than 0.

  //const scroll_width = (view_width * view_width / total_content_width);

  scroll_bar.attr("width", scroll_width);
  scroll_barB.attr("width", scroll_width);

  // Set up scroll events
  //non_scrolling.on('wheel', (e) => {
  // updateScrollPosition(event.deltaY)})

  // Set up scrollbar drag events
  const dragBehaviour = d3.drag().on("drag", () => {
    updateScrollPosition(
      (d3.event.dx * maxScroll) / (view_width - scroll_width)
    );
  });
  scroll_bar.call(dragBehaviour);
  scroll_barB.call(dragBehaviour);

  const dragBehaviourRev = d3.drag().on("drag", () => {
    updateScrollPosition(d3.event.dx * -1);
  });
  scroll_group.call(dragBehaviourRev);
  non_scrolling.call(dragBehaviourRev);

  resize_orf_text();
});

function updateScrollPosition(diff) {
  scrollDistance += diff;
  scrollDistance = Math.max(0, scrollDistance);
  scrollDistance = Math.min(maxScroll, scrollDistance);
  content_group.attr(
    "transform",
    `translate(${view_x + offset_x - scrollDistance},${view_y + offset_y})`
  ); //
  const scrollBarPosition =
    (scrollDistance / maxScroll) * (view_width - scroll_width - view_x);
  scroll_bar.attr("x", scrollBarPosition);
  scroll_barB.attr("x", scrollBarPosition); //
}

function redraw() {
  calcsizes();
  non_scrolling_back.attr("width", view_width).attr("height", view_height);
  non_scrolling.attr("viewBox", "0 0 " + view_width + " " + view_height);
  //non_scrolling.selectAll("text.heading").attr("y", function(d) {return (d.y_offset - arrowheight - 20 + offset_y);})
  clip_rect.attr("width", view_width);
  scroll_group.attr("width", view_width);
  scroll_rect.attr("width", view_width);
  scroll_bar.attr("width", scroll_width);
  scroll_barB.attr("width", scroll_width);
  content_box = content_group.node().getBBox(); // this returns the dimensions of the content canvas
  total_content_width = Math.max(content_box.x + content_box.width, view_width);
  orf_shape = get_orf_shape(arrowpoint, arrowheight);
  maxScroll = Math.max(total_content_width - view_width + offset_x * 3, 0); // can only scroll to the end of the content and can't go less than 0.
  //content_group.selectAll("text.orf").attr("y", function(d) {return (d.y_offset + arrowheight/2);})
  //resize_orf_text();
}

function resize_orf_text() {
  content_group.selectAll("text.orf").text(function (d) {
    return ellipse_orf_text(this.getBBox(), xScale(d.end - d.start), d.text);
  });
  content_group.selectAll("text.orf").style("font", function (d) {
    return reset_orf_font(this.getBBox(), xScale(d.end - d.start), fontsize);
  });
}

window.addEventListener("resize", redraw);
