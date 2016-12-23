import router from "./router"


var painter = { };

class Painting {

    constructor(sel) {
        this.sel = sel;
        this.cell = sel.datum();
        this.shape = this.cell.shape();
        this.data = this.cell.d();
    }

    paint() {
        // abstract method of sorts
    }

};

class ActualPainting extends Painting {

    constructor(sel) {
        super(sel);
        this.margin = 0.1;
    }
    
    chart() {
        return this.sel.append("g")
            .attr("class", "chart")
            .attr("transform", "translate(" + this.margin * this.shape.x + "," + this.margin * this.shape.y + ")");
    }

    xRange() {
        return [this.margin * this.shape.x, (1 - this.margin) * this.shape.x];
    }

    yRange() {
        return [(1 - this.margin) * this.shape.y, this.margin * this.shape.y];
    }

};

class NotReallyAPainting extends Painting {
    
    constructor(sel) {
        super(sel);
        this.router = new router.SimpleRouter();
    }

    mesh() {
        var mesh = d3.mesh();
        mesh.x().domain([0, this.shape.x]);
        mesh.y().domain([0, this.shape.y]);
        mesh.data([[]]);

        return mesh;
    }

    goOn(sel) {
        new painter.Root(sel).paint();
    }

};


painter.Root = class Root extends NotReallyAPainting {

    paint() {
        var self = this;

        var match = self.router.route(self.data);
        var painting = new match.painting(self.sel);
        //TODO: read raw data -> label (array/object/...) -> [process] -> create children paintings (sel, raw, label, processed)
        painting.paint();
    }

}

painter.Noop = class Noop extends NotReallyAPainting {

    paint() {
        console.log("Unsupported data type");
    }

}


//TODO: pass data as argument, preprocess by caller
painter.BarChart = class BarChart extends ActualPainting {

    paint() {
        var self = this;  // d3 reserves the 'this' keyword (kinda)

    	var x = d3.scaleBand()
            .range(self.xRange())
            .padding(0.1)
            .domain(self.data.map(function(d, i) { return i; }));

        var y = d3.scaleLinear()
            .range(self.yRange())
            .domain([0, d3.max(self.data)]);

        var bar = self.chart().selectAll("g")
            .data(self.data)
            .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function(d, i) {
                    return "translate(" + x(i) + ",0)";
                });

        bar.append("rect")
            .attr("y", function(d) { return y(d); })
            .attr("height", function(d) { return (1 - self.margin) * self.shape.y - y(d); })
            .attr("width", x.bandwidth());
    }
}


painter.ScatterPlot = class ScatterPlot extends ActualPainting {

    paint() {
        var self = this;
        var radius = Math.min(self.shape.x, self.shape.y) / 25;

        var baseXRange = self.xRange();
        var x = d3.scaleLinear()
            .range([baseXRange[0] + radius, baseXRange[1] - radius])
            .domain(d3.extent(self.data.map(d => d.x)));

        var baseYRange = self.yRange();
        var y = d3.scaleLinear()
            .range([baseYRange[0] - radius, baseYRange[1] + radius])
            .domain(d3.extent(self.data.map(d => d.y)));

        var z = d3.scaleLinear()
            .range([0.1 * radius, radius])
            .domain(d3.extent(self.data.map(d => d.z)));

        var circle = self.chart().selectAll("circle")
            .data(self.data)
            .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("r", function(d) { return z(d.z); });
    }

}


painter.CallTree = class CallTree extends NotReallyAPainting {
    
    paint() {

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

       var self = this;

       var mesh = self.mesh();

       dig(0, 0, self.data);

       self.sel.selectAll("g")
           .data(mesh.flat().filter(c => c.d() != null))
           .enter().append("g")
               .attr("transform", function(d) {
                   return "translate(" + d.x().a + "," + d.y().a + ")"; })
               .each(function() {
                   d3.select(this).call(self.goOn); });
    }
}


painter.ObjectTree = class ObjectTree extends NotReallyAPainting {
    
    paint() {

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

        var self = this;

        var mesh = self.mesh();

        dig(0, 0, self.data);

        self.sel.selectAll("g")
            .data(mesh.flat().filter(c => c.d() != null))
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + d.x().a + "," + d.y().a + ")"; })
            .each(function() {
                d3.select(this).call(self.goOn); });
    }

}


painter.ObjectArray = class ObjectArray extends NotReallyAPainting {

    paint() {

        var self = this;

        var mesh = this.mesh();

        for (var i in self.data) {
            var obj = self.data[i];
            mesh.pick(0, i, obj);
        }

        self.sel.selectAll("g")
            .data(mesh.flat().filter(c => c.d() != null))
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + d.x().a + "," + d.y().a + ")"; })
            .each(function() {
                d3.select(this).call(self.goOn); });
    }

}


export default painter;
