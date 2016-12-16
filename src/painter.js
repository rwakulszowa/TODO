import router from "./router"


var painter = { };

painter.paint = function(sel) {

    var data = sel.datum().d();
    var kind = router.route(data);

    switch (kind) {
        case "callTree":
            painter.callTree(sel);
            break;
        case "numArray":
            painter.barChart(sel);
            break;
        case "anyArray":
            painter.scatterPlot(sel);
            break;
        default:
            console.log("Unsupported data type");
    }

}

//TODO: pass data as argument, preprocess by caller
painter.barChart = function(sel) {

    var cell = sel.datum(),
        shape = cell.shape(),
        data = cell.d();

    var margin = 0.1;

    var chart = sel.append("g")
        .attr("class", "chart")
        .attr("transform", "translate(" + margin * shape.x + "," + margin * shape.y + ")");

	var x = d3.scaleBand()
	    .range([margin * shape.x, (1 - margin) * shape.x])
	    .padding(0.1)
	    .domain(data.map(function(d, i) { return i; }));

	var y = d3.scaleLinear()
	    .range([(1 - margin) * shape.y, margin * shape.y])
	    .domain([0, d3.max(data)]);

	var bar = chart.selectAll("g")
	    .data(data)
	  .enter().append("g")
        .attr("class", "bar")
	    .attr("transform", function(d, i) {
		    return "translate(" + x(i) + ",0)";
	    });

	bar.append("rect")
	    .attr("y", function(d) { return y(d); })
	    .attr("height", function(d) { return (1 - margin) * shape.y - y(d); })
	    .attr("width", x.bandwidth());
}

painter.scatterPlot = function(sel) {
    //TODO refactor: get rid of repetitions; pick lin/ord scales based on input
    var cell = sel.datum(),
        shape = cell.shape(),
        data = cell.d();

    var margin = 0.1,
        radius = Math.min(shape.x, shape.y) / 25;

    var chart = sel.append("g")
        .attr("class", "chart")
        .attr("transform", "translate(" + margin * shape.x + "," + margin * shape.y + ")");

	var x = d3.scaleLinear()
	    .range([margin * shape.x + radius, (1 - margin) * shape.x - radius])
	    .domain([0, data.length - 1]);

	var y = d3.scaleLinear()
	    .range([(1 - margin) * shape.y, margin * shape.y])
	    .domain([0, d3.max(data)]);

	var circle = chart.selectAll("circle")
	    .data(data)
	  .enter().append("circle")
        .attr("class", "dot")
        .attr("r", radius)
        .attr("cx", function(d, i) { return x(i); })
        .attr("cy", function(d) { return y(d); });
}

painter.callTree = function(sel) {

    function dig(i, j, node) {

        var yOffset = 0;
        mesh.pick(i, j + yOffset, node.input);
        yOffset += 1;
        
        for (var c in node.children) {
            var child = node.children[c];
            var dug = dig(i + 1, j + yOffset, child);
            yOffset += dug;
        }

        mesh.pick(i, j + yOffset, node.output);
        yOffset += 1;

        return yOffset;
    }

    var cell = sel.datum(),
        shape = cell.shape(),
        node = cell.d();

    var mesh = d3.mesh();
    mesh.x().domain([0, shape.x]);
    mesh.y().domain([0, shape.y]);
    mesh.data([[]]);
    
    dig(0, 0, node);

    sel.selectAll("g")
        .data(mesh.flat().filter(c => c.d() != null))
      .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + d.x().a + "," + d.y().a + ")"; })
        .each(function() {
            d3.select(this).call(painter.paint); });
}

export default painter;
