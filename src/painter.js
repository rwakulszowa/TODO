var Painter = { };

Painter.barChart = function(container, size, data) {
	var chart = d3.select(container);

	var x = d3.scaleBand()
	    .range([0, size.width])
	    .padding(0.1)
	    .domain(data.map(function(d) { return d.x; }));

	var y = d3.scaleLinear()
	    .range([size.height, 0])
	    .domain([0, d3.max(data.map(function(d) { return d.y; }))]);

	var bar = chart.selectAll("g")
	    .data(data)
	  .enter().append("g")
	    .attr("transform", function(d) {
		    return "translate(" + x(d.x) + ",0)";
	    });

	bar.append("rect")
	    .attr("y", function(d) { return y(d.y); })
	    .attr("height", function(d) { return size.height - y(d.y); })
	    .attr("width", x.bandwidth());

	bar.append("text")
	    .attr("x", x.bandwidth() / 2)
	    .attr("y", function(d) { return y(d.y) + 3; })
	    .attr("dy", ".75em")
	    .text(function(d) { return d.y; });
}

