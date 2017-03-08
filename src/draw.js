import router from "./router"
import utils from "./utils"


var draw = { };


class BaseDrawing {  //TODO: add some kinda validation of data

    constructor(data, label) {
        this.data = data;
        this.label = label;
    }

    draw(sel, shape) {
        // abstract method of sorts
    }

    minDimension(shape) {
        return Math.min(shape.x, shape.y);
    }

    path(a, b) {
        return "M" + a.x + "," + a.y
            + "C" + a.x + "," + (a.y + b.y) / 2
            + " " + b.x + "," + (a.y + b.y) / 2
            + " " + b.x + "," + b.y;
    }

    translate(x, y) {
        return "translate(" + x + "," + y + ")";
    }

};


class ActualDrawing extends BaseDrawing {

    constructor(data, label) {
        super(data, label);
    }
 
    static isLeaf() {
        return true;
    }

    chart(sel, shape, margin) {
        return sel.append("g")
            .attr("class", "chart")
            .attr("transform", this.translate(margin * shape.x, margin * shape.y));
    }

    xRange(shape, margin) {
        return [margin * shape.x, (1 - margin) * shape.x];
    }

    yRange(shape, margin) {
        return [(1 - margin) * shape.y, margin * shape.y];
    }

    dashRange(scale) {
        var v = [1, 2, 4].map(x => scale * x);
        var ans = v.map(
            x => v.map(
                y => [x, y]));

        var ans = v.map(x => [x]);
        for (var i = 0; i < 2; ++i) {
            var temp = [];
            for (var a of ans) {
                for (var el of v) {
                    temp.push(a.concat([el]));
                }
            }
            ans = temp;
        }
        ans.unshift([]);  // continuous line
        return ans.map(a => a.toString());
    }

};


class NotReallyADrawing extends BaseDrawing {
    
    constructor(data, label) {
        super(data, label);
    }

    static isLeaf() {
        return false;
    }

    mesh(shape) {
        var mesh = d3.mesh();
        mesh.x().domain([0, shape.x]);
        mesh.y().domain([0, shape.y]);
        mesh.data([[]]);

        return mesh;
    }

};


class Empty extends ActualDrawing {

    draw(sel, shape) {
        // Do nothing
    }

}

draw.empty = wrapConstructor(Empty);


class Bar extends ActualDrawing {

    draw(sel, shape) {
        var self = this;
        var margin = 0.1;

    	var x = d3.scaleBand()
            .range(self.xRange(shape, margin))
            .padding(0.1)
            .domain(self.data.map((_, i) => i));

        var y = d3.scaleLinear()
            .range(self.yRange(shape, margin))
            .domain([0, d3.max(self.data)]);

        var bar = self.chart(sel, shape, margin).selectAll("g")
            .data(self.data)
            .enter().append("g")
                .attr("class", "bar")
                .attr("transform", (_, i) => self.translate(x(i), 0) );

        bar.append("rect")
            .attr("y", d => y(d))
            .attr("height", d => (1 - margin) * shape.y - y(d))
            .attr("width", x.bandwidth());
    }

}

draw.bar = wrapConstructor(Bar);


/*
 * 2D line graph
 *
 * Input format: [ { x, y, z, w }, ... ]
 * Data is expected to be sorted by x.
 */
class Line extends ActualDrawing {

    draw(sel, shape) {
        var self = this;
        var margin = 0.1;

        var x = d3.scaleLinear()
            .range(self.xRange(shape, margin))
            .domain(d3.extent(self.data.map(d => d.x)));

        var y = d3.scaleLinear()
            .range(self.yRange(shape, margin))
            .domain([0, d3.max(self.data.map(d => d.y))]);

        var z = d3.scaleOrdinal()
            .range(self.dashRange(self.minDimension(shape) / 25))
            .domain(self.data.map(d => d.z));

        var w = d3.scaleLinear()
            .range(["#555", "black"])
            .domain(self.data.map(d => d.w));

        var line = d3.line()
            .x(d => x(d.x))
            .y(d => y(d.y));

        var groupedData = utils.groupByKeys(self.data, "zw");

        var line = sel.selectAll("path")
            .data(groupedData)
            .enter().append("path")
                .attr("class", "line")
                .style("fill", "none")
                .attr("stroke-dasharray", d => z(d.z))
                .style("stroke", d => w(d.w))
                .attr("d", (d) => line(d.data));
    }

}

draw.line = wrapConstructor(Line);


class Scatter extends ActualDrawing {

    draw(sel, shape) {
        var self = this;
        var margin = 0.1;
        var radius = self.minDimension(shape) / 25;

        var baseXRange = self.xRange(shape, margin);
        var x = d3.scaleLinear()
            .range([baseXRange[0] + radius, baseXRange[1] - radius])
            .domain(d3.extent(self.data.map(d => d.x)));

        var baseYRange = self.yRange(shape, margin);
        var y = d3.scaleLinear()
            .range([baseYRange[0] - radius, baseYRange[1] + radius])
            .domain(d3.extent(self.data.map(d => d.y)));

        var z = d3.scaleLinear()
            .range([0.25 * radius, radius])
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

draw.scatter = wrapConstructor(Scatter);


class Force extends ActualDrawing {

    draw(sel, shape) {
        var self = this;

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink())
            .force("charge", d3.forceManyBody().distanceMax(
                self.minDimension(shape) / Math.sqrt(self.data.nodes.length)))
            .force("center", d3.forceCenter(shape.x / 2, shape.y / 2));

        var link = sel.selectAll(".link")
            .data(self.data.links)
          .enter().append("line")
            .attr("class", "link");

        var node = sel.selectAll(".node")
            .data(self.data.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", self.minDimension(shape) / 100);

        var ticked = function() {
            link
              .attr("x1", d => d.source.x)
              .attr("y1", d => d.source.y)
              .attr("x2", d => d.target.x)
              .attr("y2", d => d.target.y);

            node
              .attr("transform", d => self.translate(d.x, d.y));
        }

        simulation
            .nodes(self.data.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(self.data.links);
        
        return self;
    }

}

draw.force = wrapConstructor(Force);


class Tree extends ActualDrawing {

    _ring() {
        var ring = d3.arc()
            .innerRadius(0)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        return (outerRadius) => ring.outerRadius(outerRadius)();
    }

    draw(sel, shape) {
        var self = this;

        const maxRadius = self.minDimension(shape) / 10;
        const radius = {
            lo: maxRadius / 2,
            hi: maxRadius
        };

        const fontSize = radius.lo;

        const ring = self._ring();

        const plot = sel.append("g")
            .attr("transform", self.translate(0, radius.hi));

        const tree = d3.tree()
            .size([shape.x, shape.y - 2 * radius.hi]);

        var root = self.data;
        tree(root);

        const r = d3.scaleSqrt()
            .range([radius.lo, radius.hi])
            .domain(d3.extent(root.descendants().map(d => d.data.value)));

        var link = plot.selectAll(".link")
            .data(root.descendants().slice(1))
          .enter().append("path")
            .attr("class", "link")
            .attr("d", d => self.path(d, d.parent));

        var node = plot.selectAll(".node")
            .data(root.descendants())
          .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => self.translate(d.x, d.y));

        node.append("path")
            .attr("d", d => ring(r(d.data.value)));

        node.append("text")
            .style("dominant-baseline", "central")
            .style("text-anchor", "middle")
            .style("font-size", fontSize + "px")
            .text(d => d.data.value);

        return self;
    }

}

draw.tree = wrapConstructor(Tree);


class Nested extends NotReallyADrawing {

    draw(sel, shape) {
        var self = this;

        var mesh = this.mesh(shape);
        mesh.data(self.data);

        sel.selectAll("g")
            .data(mesh.flat().filter(c => c.d() != null))
          .enter().append("g")
            .attr("transform", d => self.translate(d.x().a, d.y().a))
            .each(function(d) {
                const subTree = d.d();
                subTree.draw(
                    d3.select(this),
                    d.shape());
            });
    }

}

draw.nested = wrapConstructor(Nested);

export default draw;

// Local stuff
function wrapConstructor(cls) {
    function inner() {
        return cls;
    }
    return inner;
}