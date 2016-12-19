import router from "./router"


var painter = { };

painter.paint = function(sel) {

    var data = sel.datum().d();
    var routerInstance = new router.simpleRouter();
    var dest = routerInstance.route(data);

    dest(sel);

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
	    .domain(d3.extent(data.map(d => d.x)));

	var y = d3.scaleLinear()
	    .range([(1 - margin) * shape.y - radius, margin * shape.y + radius])
	    .domain(d3.extent(data.map(d => d.y)));

	var z = d3.scaleLinear()
	    .range([0.1 * radius, radius])
	    .domain(d3.extent(data.map(d => d.z)));

	var circle = chart.selectAll("circle")
	    .data(data)
	  .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); })
        .attr("r", function(d) { return z(d.z); });
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

painter.objectTree = function(sel) {
    
    function isObject(o) {
        return o !== null &&
            !Array.isArray(o) &&
            typeof o === "object";
    }

    function dig(i, j, obj) {

        var keys = Object.keys(obj).sort(),
            yOffset = 0;

        for (var key of keys) {
            var val = obj[key];

            if (isObject(val)) {
                var dug = dig(i + 1, j + yOffset, val);
                yOffset += dug;
            } else {
                mesh.pick(i, j + yOffset, val);
                yOffset += 1;
            }
        }

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

painter.objectArray = function(sel) {

    var cell = sel.datum(),
        shape = cell.shape(),
        data = cell.d();

    var mesh = d3.mesh();
    mesh.x().domain([0, shape.x]);
    mesh.y().domain([0, shape.y]);
    mesh.data([[]]);

    for (var i in data) {
        var obj = data[i];
        mesh.pick(0, i, obj);
    }

    sel.selectAll("g")
        .data(mesh.flat().filter(c => c.d() != null))
      .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + d.x().a + "," + d.y().a + ")"; })
        .each(function() {
            d3.select(this).call(painter.paint); });
}


export default painter;
