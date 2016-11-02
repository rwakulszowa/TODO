var Painter = { };

Painter.barChart = function(segment, data) {
	var chart = segment.area;
	var size = segment.size;
	var offset = segment.offset;
	var id = segment.id;

	var x = d3.scaleBand()
	    .range([offset.x, offset.x + size.x])
	    .padding(0.1)
	    .domain(data.map(function(d) { return d.x; }));

	var y = d3.scaleLinear()
	    .range([size.y, 0])
	    .domain([0, d3.max(data.map(function(d) { return d.y; }))]);

	var bar = chart.selectAll("." + id)
	    .data(data)
	  .enter().append("g")
	    .attr("class", "." + id)
	    .attr("transform", function(d) {
		    return "translate(" + x(d.x) + ",0)";
	    });

	bar.append("rect")
	    .attr("y", function(d) { return offset.y +  y(d.y); })
	    .attr("height", function(d) { return size.y - y(d.y); })
	    .attr("width", x.bandwidth());
}

Painter.callTree = function(segment, node) {
    var isLeaf = node.children.length == 0;
    var baseDivs = 2;  // node has at least 2 plots (in, out)

    if (isLeaf) {
        var segments = segment.split(1, baseDivs);

        Painter.barChart(segments[0][0], node.input);
        Painter.barChart(segments[0][1], node.output);
    } else {
        var rows = baseDivs + node.children.length;
        var segments = segment.split(2, rows);
        
        Painter.barChart(segments[0][0], node.input);
        Painter.barChart(segments[0][rows - 1], node.output);
        
        for (var i in node.children) {
            i = parseInt(i);  // js is weird
            Painter.callTree(segments[1][i + 1], node.children[i]);
        }
    }
}
