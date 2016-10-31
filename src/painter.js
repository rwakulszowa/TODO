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
	    .range([offset.y + size.y, offset.y])
	    .domain([0, d3.max(data.map(function(d) { return d.y; }))]);

	var bar = chart.selectAll("." + id)
	    .data(data)
	  .enter().append("g")
	    .attr("class", "." + id)
	    .attr("transform", function(d) {
		    return "translate(" + x(d.x) + ",0)";
	    });

	bar.append("rect")
	    .attr("y", function(d) { return y(d.y); })
	    .attr("height", function(d) { return size.y - y(d.y); })  //TODO: flip the y range
	    .attr("width", x.bandwidth());

	bar.append("text")
	    .attr("x", x.bandwidth() / 2)
	    .attr("y", function(d) { return y(d.y) + 3; })
	    .attr("dy", ".75em")
	    .text(function(d) { return d.y; });
}

