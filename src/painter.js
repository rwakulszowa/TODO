var Painter = { };

Painter.paint = function(sel) {

    function hasKeys(o, keys) {
        var keys = keys.sort();
        var oKeys = Object.keys(o);
        return oKeys.every(k => keys.indexOf(k) != -1);
    }

    var data = sel.datum().d();
    if (hasKeys(data, ["input", "output", "children"])) {
        Painter.callTree(sel);
    } else if (Array.isArray(data) && data.every(d => Number.isFinite(d))) {
        Painter.barChart(sel);
    } else {
        console.log("Unknown data type" + data);
    }
}

Painter.barChart = function(sel) {

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


Painter.callTree = function(sel) {

    function dig(i, j, node) {

        mesh.pick(i, j, node.input);
        
        //TODO: find a simpler solution to calculate relative position
        var yOffset = 1;
        for (var c in node.children) {
            var child = node.children[c];
            dig(i + 1, j + yOffset, child);
            yOffset += child.shape().y;
        }

        mesh.pick(i, j + node.shape().y - 1, node.output);
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
            d3.select(this).call(Painter.paint); });
}
