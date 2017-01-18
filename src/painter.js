import router from "./router"


var painter = { };

class Painting {

    constructor(data, extras, label) {
        this.data = data;
        this.extras = extras;
        this.label = label;
    }

    bindings() {
        return [];
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
        return ["router"];
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

painter.TreePlot = class TreePlot extends ActualPainting {

    paint(sel, shape) {
        var self = this;

        const radius = Math.min(shape.x, shape.y) / 25;

        const plot = sel.append("g")
            .attr("transform", "translate(0," + 2 * radius + ")");

        const tree = d3.tree()
            .size([shape.x, shape.y - 2 * radius]);

        var root = self.data;
        tree(root);

        const r = d3.scaleLinear()
            .range([0.1 * radius, radius])
            .domain(d3.extent(root.descendants().map(d => d.value)));

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
            .attr("class", "node")
            .attr("transform", d => "translate(" + d.x + "," + d.y + ")");

        node.append("circle")
            .attr("r", d => r(d.value));

        node.append("text")
            .attr("dx", -radius)
            .style("text-anchor", "end")
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
