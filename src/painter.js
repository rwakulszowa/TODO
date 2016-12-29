import router from "./router"


var painter = { };

class Painting {

    constructor(data) {
        this.data = data;
    }

    paint(sel, shape) {
        // abstract method of sorts
    }

};

class ActualPainting extends Painting {

    constructor(data) {
        super(data);
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
    
    constructor(data) {
        super(data);
    }

    mesh(shape) {
        var mesh = d3.mesh();
        mesh.x().domain([0, shape.x]);
        mesh.y().domain([0, shape.y]);
        mesh.data([[]]);

        return mesh;
    }

    router() {
        return new router.SimpleRouter();
    }

    goOn(sel, self, data, shape) {
        self.router().proceed(data, sel, shape);
    }

};


painter.Noop = class Noop extends NotReallyAPainting {

    paint(sel, shape) {
        console.log("Unsupported data type");
    }

}


painter.BarChart = class BarChart extends ActualPainting {

    paint(sel, shape) {
        var self = this;  // d3 reserves the 'this' keyword (kinda)
        var margin = 0.1;

    	var x = d3.scaleBand()
            .range(self.xRange(shape, margin))
            .padding(0.1)
            .domain(self.data.map(function(d, i) { return i; }));

        var y = d3.scaleLinear()
            .range(self.yRange(shape, margin))
            .domain([0, d3.max(self.data)]);

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

painter.PlotMesh = class PlotMesh extends NotReallyAPainting {

    paint(sel, shape) {
        var self = this;

        var mesh = this.mesh(shape);
        mesh.data(self.data);

        sel.selectAll("g")
            .data(mesh.flat().filter(c => c.d() != null))
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + d.x().a + "," + d.y().a + ")"; })
            .each(function(d) {
                d3.select(this).call(self.goOn, self, d.d(), d.shape()); });
    }

}

export default painter;
