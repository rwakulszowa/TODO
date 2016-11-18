var Painter = { };


Painter.barChart = function(sel) {

    var cell = sel.datum(),
        shape = cell.shape(),
        data = cell.d();

	var x = d3.scaleBand()
	    .range([0, shape.x])
	    .padding(0.1)
	    .domain(data.map(function(d, i) { return i; }));

	var y = d3.scaleLinear()
	    .range([shape.y, 0])
	    .domain([0, d3.max(data)]);

	var bar = sel.selectAll("g")
	    .data(data)
	  .enter().append("g")
	    .attr("transform", function(d, i) {
		    return "translate(" + x(i) + ",0)";
	    });

	bar.append("rect")
	    .attr("y", function(d) { return y(d); })
	    .attr("height", function(d) { return shape.y - y(d); })
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
            d3.select(this).call(Painter.barChart); });
}
