import * as d3 from "d3";

const arrow_tip_length = 10;
const arrow_height = 30;
const global_top = 50;
const geneSpacing = 5;
const arc_pad = 0.003; //used to make sure the systems are visible on the screen
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const contigHeightWidthRatio = 7 / 6;

let contig_data = require("./contig_data.json");
let system_data = require("./system_data.json");

function arrow_vertices(start, end, strand) {
  let len = Math.abs(end - start);
  var top;
  var mid_x;

  if (strand === 1) {
    mid_x = start;
    top = global_top + 10;
    if (len > arrow_tip_length) {
      mid_x = end - arrow_tip_length;
    }
  } else if (strand === -1) {
    [start, end] = [end, start];
    mid_x = start;
    top = global_top + arrow_height + 20;
    if (len > arrow_tip_length) {
      mid_x = end + arrow_tip_length;
    }
  }

  var result = [
    [start, top],
    [start, top + arrow_height],
    [mid_x, top + arrow_height],
    [end, top + arrow_height / 2],
    [mid_x, top],
  ];

  return result;
}

export const drawSystems = (contigBoxRef, geneBoxRef) => {
  const contigBox = d3.select(contigBoxRef);
  const geneBox = d3.select(geneBoxRef);

  const contigBoxWidth = contigBoxRef.getBoundingClientRect().width;
  const geneBoxWidth = geneBoxRef.getBoundingClientRect().width;

  const track_width = geneBoxWidth - margin.right - margin.left;

  const tooltip = geneBox
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "black")
    .style("color", "white")
    .style("font-family", "Helvetica, Arial, sans-serif")
    .style("padding", "5px");

  const system_info = geneBox
    .append("div")
    .style("padding", "25px 25px 25px 25px")
    .style("font-family", "Helvetica, Arial, sans-serif");

  const geneSvg = geneBox
    .append("svg")
    .attr("width", geneBoxWidth)
    .attr("height", "100%");

  function clear_genes() {
    d3.selectAll("polygon").remove();
    d3.selectAll("gene").remove();
    d3.selectAll("g .track").remove();
  }

  function draw_genes(sys_id) {
    // Fetch the gene data associated to the system
    let system = system_data.find((d) => d.sys_id === sys_id);
    // Compute relative positions in the system's neighborhood
    const contig_L = system.contig_length;
    const sys_start = system.neighborhood_start;
    const sys_end = system.neighborhood_end;
    const sys_L = (sys_end - sys_start) % contig_L;
    const sys_color = system.hex_code_rainbow;

    let gene_data = system["genes"];
    gene_data = gene_data.map((obj) => ({
      ...obj,
      rel_start: ((obj.start - sys_start) * track_width) / sys_L,
    }));
    gene_data = gene_data.map((obj) => ({
      ...obj,
      rel_end: ((obj.end - sys_start) * track_width) / sys_L,
    }));

    // Add a first track

    const track = geneSvg
      .append("g")
      .attr("class", "track")
      .attr("transform", `translate(${margin.left},0)`);

    // Add a middle line per track
    const linePos = global_top + arrow_height + geneSpacing + 10;
    track
      .append("line")
      .attr("x1", 0)
      .attr("y1", linePos)
      .attr("x2", geneBoxWidth - margin.right - margin.left)
      .attr("y2", linePos)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", 0.5)
      .style("stroke-dasharray", 4);

    // for each track, add a "gene" element per data point
    const genes = track
      .selectAll("g .gene")
      .data(gene_data)
      .join("g")
      .attr("class", "gene")
      .attr("role", (d) => d.role);

    // Add an arrow per gene
    const gene_arrows = genes
      .data(gene_data)
      .append("polygon")
      .attr("points", function (d) {
        return arrow_vertices(d.rel_start, d.rel_end, d.strand).join(" ");
      })
      .attr("class", "gene_arrow")
      .attr("fill", function (d) {
        return d.role === "non defensive" ? "#FBFCFC" : sys_color;
      })
      .attr("fill-opacity", "0.5")
      .attr("stroke-width", "1")
      .attr("stroke", "black")
      .attr("strand", function (d) {
        return d.strand;
      })
      .attr("start", (d) => d.start)
      .attr("end", (d) => d.end)
      .attr("role", (d) => d.role);

    const mouseover = (_e, _d) => {
      d3.select(this)
        .transition()
        .ease(d3.easeQuad)
        .duration(200)
        .attr("fill-opacity", 0.9);

      tooltip.style("opacity", 0.8);
    };

    const mouseleave = (_d) => {
      d3.select(this)
        .transition()
        .ease(d3.easeQuad)
        .duration(200)
        .attr("fill-opacity", 0.5);

      tooltip.style("opacity", 0);
    };

    const mousemove = (e, d) => {
      tooltip
        .html(
          `<b>Role</b>: ${d.role}<br><b>start:</b> ${d.start}<br><b>end:</b> ${d.end}`
        )
        .style("left", d3.pointer(e, this)[0] + 70 + contigBoxWidth + "px")
        .style("top", d3.pointer(e, this)[1] + "px");
    };

    // Transparency changes based on hover
    gene_arrows
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  }

  // Creating the svg box of contigbox
  const contig_svg = contigBox
    .append("svg")
    .attr("width", contigBoxWidth)
    .attr("height", contigBoxWidth * contigHeightWidthRatio);

  // Sort contigs by descending length.
  // The longest one will fill 90% of the contig box's width, and be centered horizontally.
  contig_data.sort((a, b) => b.length - a.length);

  // Compute relative length to the longest contig, and relative contig radius
  const reference_length = contig_data[0].length;
  const contig_margin = 0.05 * contigBoxWidth;

  // Create one group per contig, with id = contig.name
  const contig_groups = contig_svg
    .selectAll(".contig-group")
    .data(contig_data)
    .join("g")
    .attr("class", "contig-group")
    .attr("id", (d) => d.name)
    .attr("fullName", (d) => d.description);

  // Computing  length relative to the longest contig, and derive radii of contigs on the screen
  contig_data = contig_data.map((obj) => ({
    ...obj,
    relative_length: obj.length / reference_length,
  }));

  contig_data = contig_data.map((obj) => ({
    ...obj,
    radius: ((contigBoxWidth * 0.8) / 2) * obj.relative_length,
  }));

  // I compute a y_displacement per contig, preparing to apply a 'translate' operation to each contig group
  let current_pos = 0;
  for (const el of contig_data) {
    current_pos += contig_margin + el.radius;
    el.y_displacement = current_pos;
    current_pos += contig_margin + el.radius;
  }

  // move the center of the contig-groups
  contig_groups
    .data(contig_data)
    .join()
    .attr(
      "transform",
      (d) => `translate(${contigBoxWidth / 2}, ${d.y_displacement})`
    );

  // Draw arc
  const arcGenerator = d3.arc().padAngle(0.02).padRadius(100).cornerRadius(4);

  const arcData = contig_data.map(function (d) {
    return {
      startAngle: 0,
      endAngle: 2 * Math.PI,
      innerRadius: d.radius - 3,
      outerRadius: d.radius + 3,
    };
  });

  contig_groups
    .append("path")
    .attr("class", "contig-circle")
    .data(arcData)
    .join("path")
    .attr("d", arcGenerator)
    .attr("fill", "#FBFCFC");

  // Compute the start and end angles.

  system_data = system_data.map((obj) => ({
    ...obj,
    startAngle:
      2 *
      Math.PI *
      (((obj.neighborhood_start - reference_length * arc_pad) %
        reference_length) /
        obj.contig_length),
  }));
  system_data = system_data.map((obj) => ({
    ...obj,
    endAngle:
      2 *
      Math.PI *
      (((obj.neighborhood_end + reference_length * arc_pad) %
        reference_length) /
        obj.contig_length),
  }));

  // Attribute systems to the corresponding groups. For each contig-group,
  // there should be a bunch of system-groups inside with there corresponding arcs

  for (const el of contig_data) {
    const name = el.name;
    const radius = el.radius;

    const contig_system_data = system_data.filter((sys) => sys.contig === name);

    let arcGenerator = d3
      .arc()
      .padAngle(0)
      .padRadius(radius)
      .cornerRadius(2)
      .innerRadius(radius - 7)
      .outerRadius(radius + 10);

    const contig_id = `[id='${name}']`;

    d3.select(contig_id)
      .selectAll(".sys-arc")
      .data(contig_system_data)
      .join("path")
      .attr("class", "sys-arc")
      .attr("id", (d) => d.sys_id)
      .attr("d", arcGenerator)
      .attr("fill", (d) => d.hex_code_rainbow)
      .attr("fill-opacity", "0.7")
      .style("cursor", "pointer");
  }

  geneBox
    .append("g")
    .attr("class", "namebox")
    .attr("transform", "translate(25,25)");

  geneBox
    .append("div")
    .style("padding", "25px 25px 25px 25px")
    .style("font-family", "Helvetica, Arial, sans-serif");

  system_info.html("Click on one of the systems!");

  d3.selectAll(".sys-arc").on("click", function (_e, _d) {
    clear_genes();
    draw_genes(this.id);
    const contigName = this.parentNode.getAttribute("fullName");
    let disp_sys_name = this.id.replace("UserReplicon_", "").replace(/_/g, " ");
    system_info.html(
      `<b>Contig:</b> ${contigName}<br><b>System</b>: ${disp_sys_name}`
    );
  });

  d3.selectAll(".sys-arc")
    .on("mouseover", function () {
      d3.select(this)
        .transition()
        .ease(d3.easeQuad)
        .duration(200)
        .attr("fill-opacity", 0.9);
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .ease(d3.easeQuad)
        .duration(200)
        .attr("fill-opacity", 0.7);
    });

  return () => {
    // TODO: remove listeners
  };
};
