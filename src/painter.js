import router from "./router"


var painter = { };

class Painting {

    constructor(data, extras, label) {
        this.data = data;
        this.extras = extras;
        this.label = label;
    }

    bindings() {
        return ["class"];
    }

    paint(sel, shape) {
        // abstract method of sorts
    }

    prepare() {
        return this;
    }

    getExtra(param) {
        var found = this.extras.find(
            e => e.matches(this.label, param));
        return found ? found.value : null;
    }

    cssClass() {
        return this.getExtra("class") || ((x) => "");
    }

};

class ActualPainting extends Painting {

    constructor(data, extras, label) {
        super(data, extras, label);
    }

    chart(sel, shape, margin) {
        return sel.append("g")
            .attr("class", "chart")
            .attr("transform", "translate(" + margin * shape.x + "," + margin * shape.y + ")");
    }

    xRange(shape, margin) {
        return [margin * shape.x, (1 - margin) * shape.x];
    }

    yRange(shape, margin) {
        return [(1 - margin) * shape.y, margin * shape.y];
    }

};

class NotReallyAPainting extends Painting {
    
    constructor(data, extras, label) {
        super(data, extras, label);
    }

    bindings() {
        return super.bindings().concat(["router"]);
    }

    mesh(shape) {
        var mesh = d3.mesh();
        mesh.x().domain([0, shape.x]);
        mesh.y().domain([0, shape.y]);
        mesh.data([[]]);

        return mesh;
    }

    router() {
        return this.getExtra("router") || new router.SimpleRouter();
    }

};


painter.Noop = class Noop extends NotReallyAPainting {

    paint(sel, shape) {
    }

}


painter.BarChart = class BarChart extends ActualPainting {

    bindings() {
        return super.bindings().concat(["ySpan"]);
    }

    ySpan() {
        return this.getExtra("ySpan") || [0, d3.max(this.data)];
    }

    paint(sel, shape) {
        var self = this;
        var margin = 0.1;

    	var x = d3.scaleBand()
            .range(self.xRange(shape, margin))
            .padding(0.1)
            .domain(self.data.map(function(d, i) { return i; }));

        var y = d3.scaleLinear()
            .range(self.yRange(shape, margin))
            .domain(self.ySpan());

        var bar = self.chart(sel, shape, margin).selectAll("g")
            .data(self.data)
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
}


painter.ScatterPlot = class ScatterPlot extends ActualPainting {

    paint(sel, shape) {
        var self = this;
        var margin = 0.1;
        var radius = Math.min(shape.x, shape.y) / 25;

        var baseXRange = self.xRange(shape, margin);
        var x = d3.scaleLinear()
            .range([baseXRange[0] + radius, baseXRange[1] - radius])
            .domain(d3.extent(self.data.map(d => d.x)));

        var baseYRange = self.yRange(shape, margin);
        var y = d3.scaleLinear()
            .range([baseYRange[0] - radius, baseYRange[1] + radius])
            .domain(d3.extent(self.data.map(d => d.y)));

        var z = d3.scaleLinear()
            .range([0.1 * radius, radius])
            .domain(d3.extent(self.data.map(d => d.z)));

        var circle = self.chart(sel, shape, margin).selectAll("circle")
            .data(self.data)
            .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("r", function(d) { return z(d.z); });
    }

}

painter.ForceGraph = class ForceGraph extends ActualPainting {

    paint(sel, shape) {
        var self = this;

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink())
            .force("charge", d3.forceManyBody().distanceMax(Math.min(shape.x, shape.y) / Math.sqrt(self.data.nodes.length)))
            .force("center", d3.forceCenter(shape.x / 2, shape.y / 2));

        var link = sel.selectAll(".link")
            .data(self.data.links)
          .enter().append("line")
            .attr("class", "link");

        var node = sel.selectAll(".node")
            .data(self.data.nodes)
          .enter().append("circle")  //TODO: add a circle / circleFactory method
            .attr("class", "node")
            .attr("r", 5);  //TODO: add a method to get the smaller dimension

        var ticked = function() {
            link
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

            node
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

        simulation
            .nodes(self.data.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(self.data.links);
        
        return self;
    }

}

painter.TreePlot = class TreePlot extends ActualPainting {

    _ring() {
        var ring = d3.arc()
            .innerRadius(0)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        return (outerRadius) => ring.outerRadius(outerRadius)();
    }

    paint(sel, shape) {
        var self = this;

        const maxRadius = Math.min(shape.x, shape.y) / 10;
        const radius = {
            lo: maxRadius / 2,
            hi: maxRadius
        };

        const fontSize = radius.lo;

        const ring = self._ring();

        const plot = sel.append("g")
            .attr("transform", "translate(0," + radius.hi + ")");

        const tree = d3.tree()
            .size([shape.x, shape.y - 2 * radius.hi]);

        var root = self.data;
        tree(root);

        const r = d3.scaleSqrt()
            .range([radius.lo, radius.hi])
            .domain(d3.extent(root.descendants().map(d => d.value)));

        var cssClass = this.cssClass();

        var link = plot.selectAll(".link")
            .data(root.descendants().slice(1))
          .enter().append("path")
            .attr("class", "link")
            .attr("d", function(d) {
                return "M" + d.x + "," + d.y
                    + "C" + d.x + "," + (d.y + d.parent.y) / 2
                    + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
                    + " " + d.parent.x + "," + d.parent.y;
            });

        var node = plot.selectAll(".node")
            .data(root.descendants())
          .enter().append("g")
            .attr("class", d => "node " + cssClass(d.data))
            .attr("transform", d => "translate(" + d.x + "," + d.y + ")");

        node.append("path")
            .attr("d", d => ring(r(d.value)));

        node.append("text")
            .style("dominant-baseline", "central")
            .style("text-anchor", "middle")
            .style("font-size", fontSize + "px")
            .text(d => d.data.value);

        return self;
    }

}

painter.PlotMesh = class PlotMesh extends NotReallyAPainting {

    paint(sel, shape) {
        var self = this;

        var mesh = this.mesh(shape);
        mesh.data(self._children);

        sel.selectAll("g")
            .data(mesh.flat().filter(c => c.d() != null))
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + d.x().a + "," + d.y().a + ")"; })
            .each(function(d) {
                var painting = d.d();
                var sel = d3.select(this);
                painting.paint(sel, d.shape());
            });
    }

    prepare() {
        var router = this.router();
        var newData = this.data.map(
            row => row.map(
                el => router.proceed(el, this.extras)));
        this._children = newData;

        return this;
    }

}

export default painter;
