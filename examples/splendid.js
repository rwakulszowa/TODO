(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.splendid = global.splendid || {})));
}(this, (function (exports) { 'use strict';

var utils = {};

utils.groupByKeys = function(seq, keys) {
    var ans = new Map();
    for (var obj of seq) {
        const complexKey = {};
        for (var key of keys) {
            complexKey[key] = obj[key];
        }
        const strKey = JSON.stringify(complexKey);
        if (ans.has(strKey)) {
            ans.get(strKey).data.push(obj);
        } else {
            const entry = complexKey;
            entry.data = [obj];
            ans.set(strKey, entry);
        }
    }
    return [...ans.keys()].map(key => ans.get(key));
};

utils.renameProperty = function(obj, oldName, newName) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
    return obj;
};

utils.mapTree = function(tree, fun) {
    fun(tree);
    if (tree.children) {
        tree.children.forEach(
            t => utils.mapTree(t, fun));
    }
    return tree;
};

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

}


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

}


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

}


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

        const radius = self.minDimension(shape) / 100;
        const maxStrLength = d3.max(self.data.nodes.map(d => d.id.toString().length));
        const fontSize = radius / maxStrLength;

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id))
            .force("charge", d3.forceManyBody().distanceMax(
                self.minDimension(shape) / Math.sqrt(self.data.nodes.length)))
            .force("center", d3.forceCenter(shape.x / 2, shape.y / 2));

        var link = sel.selectAll(".link")
            .data(self.data.links)
          .enter().append("line")
            .attr("class", "link");

        var node = sel.selectAll(".node")
            .data(self.data.nodes)
          .enter().append("g")
            .attr("class", "node")
            .attr("fill", d => color(d.group));

        node.append("circle")
            .attr("r", radius);

        node.append("text")
            .style("dominant-baseline", "central")
            .style("text-anchor", "middle")
            .style("font-size", fontSize + "px")
            .text(d => d.id.toString());

        var ticked = function() {
            link
              .attr("x1", d => d.source.x)
              .attr("y1", d => d.source.y)
              .attr("x2", d => d.target.x)
              .attr("y2", d => d.target.y);

            node
              .attr("transform", d => self.translate(d.x, d.y));
        };

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

    draw(sel, shape) {
        var self = this;

        const maxRadius = self.minDimension(shape) / 10;
        const radius = {
            lo: maxRadius / 2,
            hi: maxRadius
        };

        const plot = sel.append("g")
            .attr("transform", self.translate(0, radius.hi));

        const tree = d3.tree()
            .size([shape.x, shape.y - 2 * radius.hi]);

        var root = self.data;
        tree(root);

        const maxStrLength = d3.max(root.descendants().map(d => d.data.value.toString().length));
        const fontSize = radius.lo / maxStrLength;

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

        node.append("circle")
            .attr("r", d => r(d.data.value));

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

// Local stuff
function wrapConstructor(cls) {
    function inner() {
        return cls;
    }
    return inner;
}

var test = { };

test.isObject = function(o) {
    return o !== null &&
        !Array.isArray(o) &&
        typeof o === "object";
};

test.hasKeys = function(o, keys) {
    if (test.isObject(o)) {
        var oKeys = Object.keys(o);
        return keys.every(k => oKeys.indexOf(k) != -1);
    } else {
        return false;
    }
};

test.hasExactKeys = function(o, keys) {
    if (test.isObject(o)) {
        var oKeys = Object.keys(o);
        return oKeys.length == keys.length &&
            keys.every(k => oKeys.indexOf(k) != -1);
    } else {
        return false;
    }
};

test.isArrayOf = function(subTest) {
    function inner(data) {
        return Array.isArray(data) &&
            data.every(subTest);
    }
    return inner;
};

test.isNumericArray = test.isArrayOf(Number.isFinite);

test.isFlatArray = test.isArrayOf(x => !Array.isArray(x));

test.isExactObjArray = function(keys) {
    return test.isArrayOf(d => test.hasExactKeys(d, keys));
};

test.isNodeTree = function(data) {
    return test.hasKeys(data, ["children"]);
};

test.objectNestedTest = function(keyTestPairs) {
    const keys = Object.keys(keyTestPairs);
    function inner(data) {
        return test.hasExactKeys(data, keys) &&
            keys.every(function(key) {
                var subTest = keyTestPairs[key];
                var subData = data[key];
                return subTest(subData);
            });
    }
    return inner;
};

var process = { };

process.chain = function(funs) {
    function inner(data) {
        for (var fun of funs) {
            data = fun(data);
        }
        return data;
    }
    return inner;
};

process.sortByX = function(data) {
    return data.sort((a, b) => b.x < a.x ? -1 : b.x > a.x ? 1 : 0);
};

process.fillXYZ = function(keys) {
    function inner(data) {
        return data.map(function(d) {
            const ans = {};
            keys.forEach(k => ans[k] = d[k] || 0);
            return ans;
        });
    }
    return inner;
};

process.wrapArray = function(data) {
    return [data];
};

process.digObjectTree = function(data) {

    function moveMatrix(mat) {
        mat.forEach(col => col.splice(0, 0, null));
        return mat;
    }

    function dig(obj) {
        var keys = Object.keys(obj),
            vals = keys.sort().map(k => obj[k]);

        var testFun = function(obj) {
            // Only dig objects of the same signature
            return test.isObject(obj) &&
                Object.keys(obj).length == keys.length &&
                test.hasKeys(obj, keys);
        };

        var dug = vals.map(function(v) {
            return testFun(v) ? moveMatrix(dig(v)) : [[v]];
        });

        var flattened = [].concat.apply([], dug);
        return flattened;
    }

    return dig(data);
};

process.graphify = function(data) {
    const nodes = data.nodes.map(x => ({ id: x, group: 0 }));
    const links = data.links.map(x => ({ source: x[0], target: x[1] }));
    return { nodes, links };
};

process.hierarchize = function(data) {
    const keys = Object.keys(data);
    keys.pop("children");
    // Try to guess the value key
    const key = keys.includes("value") ? "value" : keys[0];
    if (key != "value") {
        // Remap the guessed key to "value" property
        data = utils.mapTree(data, t => utils.renameProperty(t, key, "value"));
    }
    return d3.hierarchy(data);
};

var tree = {};


class Tree$1 {
    constructor(drawing, match) {
        this.drawing = drawing;
        this.match = match;
    };

    dumps() {
        return JSON.stringify(
            this.dump(),
            null,
            2);
    }
}


tree.leaf = class Leaf extends Tree$1 {
    constructor(drawing, data, match) {
        super(drawing, match);
        this.data = data;
    }

    dump() {
        return {
            "label": this.match.label
        };
    }

    draw(sel, shape) {
        const drawing = new this.drawing(
            this.data,
            this.match.label
        );
        drawing.draw(
            sel,
            shape
        );
    }
};


tree.node = class Node extends Tree$1 {
    constructor(drawing, children, match) {
        super(drawing, match);
        this.children = children;
    }

    dump() {
        return {
            "label": this.match.label,
            "children": this.childrenFlat().map(x => x.dump()),
        };
    }

    childrenFlat() {
        return this.children.reduce(
            function(acc, val) {
                acc.push(...val);
                return acc;
            },
            []);
    }

    draw(sel, shape) {
        const drawing = new this.drawing(
            this.children,
            this.match.label
        );
        drawing.draw(
            sel, shape
        );
    }
};

var router = {};

router.SimpleRouter = class {

    constructor() {
        this.patterns = [
            {
                label: "Graph",
                test: test.objectNestedTest(
                    {
                        nodes: test.isArrayOf(x => test.hasKeys(x, ["id"])),
                        links: test.isExactObjArray(["source", "target"])
                    }
                ),
                draw: draw.force()
            },
            {
                label: "SimpleGraph",
                test: test.objectNestedTest(
                    {
                        nodes: test.isFlatArray,
                        links: test.isArrayOf(x => Array.isArray(x) && x.length == 2)
                    }
                ),
                process: process.graphify,
                draw: draw.force()
            },
            {
                label: "Tree",
                test: test.isNodeTree,
                process: process.hierarchize,
                draw: draw.tree()
            },
            {
                label: "ObjectTree",
                test: test.isObject,
                process: process.digObjectTree,
                draw: draw.nested()
            },
            {
                label: "Numbers",
                test: test.isNumericArray,
                draw: draw.bar()
            },
            {
                label: "XYArray",
                test: test.isExactObjArray(["x", "y"]),
                process: process.chain([
                    process.fillXYZ(["x", "y", "z", "w"]),
                    process.sortByX]),
                draw: draw.line()
            },
            {
                label: "XYZArray",
                test: test.isExactObjArray(["x", "y", "z"]),
                draw: draw.scatter()
            },
            {
                label: "XYZWArray",
                test: test.isExactObjArray(["x", "y", "z", "w"]),
                process: process.sortByX,
                draw: draw.line()
            },
            {
                label: "AnyArray",
                test: Array.isArray,
                process: process.wrapArray,
                draw: draw.nested()
            }
        ];
    }

    isForced(obj) {
        return obj && Object.keys(obj).indexOf("SplendidLabel") != -1;
    }

    matchByLabel(data) {
        return this.patterns.find(x => x.label == data.SplendidLabel);
    }

    unwrapForcedData(data) {
        return data.data;
    }

    extend(patterns) {
        this.patterns = patterns.concat(this.patterns);
        return this;
    }

    match(data) {
        for (var pattern of this.patterns) {
            if (pattern.test(data)) {
                return pattern;
            }
        }
        return {
            label: "Ignored",
            test: () => true,
            draw: draw.empty()
        };
    }

    route(data) {
        var match;

        if (this.isForced(data)) {
            match = this.matchByLabel(data);
            data = this.unwrapForcedData(data);
        } else {
            match = this.match(data);
        }

        const draw$$1 = match.draw;
        data = match.process ? match.process(data) : data;

        return {
            draw: draw$$1,
            data,
            match
        }
    }

    buildTree(data) {
        var t;
        const routed = this.route(data);

        if (routed.draw.isLeaf()) {
            t = new tree.leaf(
                routed.draw,
                routed.data,
                routed.match);
        } else {
            const children = routed.data.map(
                arr => arr.map(
                    d => this.buildTree(d)));
            t = new tree.node(
                routed.draw,
                children,
                routed.match);
        }

        return t;
    }
};

//NOTE: not used right now
//TODO: get extra data from the Tree
class Extra {

    constructor(value, bindings, updateFun) {
        this.value = value;
        this.bindings = bindings;
        this.updateFun = updateFun || defaultUpdateFun;
    }

    update(newValue) {
        this.value = this.updateFun(this.value, newValue);
        return this;
    }

    matches(label, param) {
        for (var key of this.bindings) {
            var pair = key.split(".");
            if ( (label === pair[0] || "*" === pair[0]) && param === pair[1])
                return true;
        }
        return false;
    }
}

function defaultUpdateFun(oldVal, newVal) {
    return newVal;
}

//TODO: turn this into a d3-like object
function show(data, size, container, extras) {
    size = size || { x: 860, y: 640 };
    container = container || d3.select("body")
	  .append("svg")
	    .attr("width", size.x)
	    .attr("height", size.y);
    extras = extras || [];

    const routerInstance = new router.SimpleRouter();
    const tree = routerInstance.buildTree(data, extras);
    tree.draw(container, size);
}

exports.show = show;
exports.draw = draw;
exports.extra = Extra;
exports.process = process;
exports.router = router;
exports.test = test;
exports.utils = utils;

Object.defineProperty(exports, '__esModule', { value: true });

})));
