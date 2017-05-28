(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.splendid = global.splendid || {})));
}(this, (function (exports) { 'use strict';

var draw = { };


class BaseDrawing {

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

}


class Scatter extends ActualDrawing {

    draw(sel, shape) {
        var self = this;
        var margin = 0.1;
        var radius = self.minDimension(shape) / 25;

        var baseXRange = self.xRange(shape, margin);
        var x = d3.scaleLinear()
            .range([baseXRange[0] + radius, baseXRange[1] - radius])
            .domain([0, self.data.length]);

        var baseYRange = self.yRange(shape, margin);
        var y = d3.scaleLinear()
            .range([baseYRange[0] - radius, baseYRange[1] + radius])
            .domain(d3.extent(self.data));

        var circle = self.chart(sel, shape, margin).selectAll("circle")
            .data(self.data)
            .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function(d, i) { return x(i); })
                .attr("cy", function(d) { return y(d); })
                .attr("r", 9);
    }

}

draw.scatter = wrapConstructor(Scatter);

// Local stuff
function wrapConstructor(cls) {
    function inner() {
        return cls;
    }
    return inner;
}

var test = { };

test.isArrayOf = function(subTest) {
    function inner(data) {
        return Array.isArray(data) &&
            data.every(subTest);
    }
    return inner;
};

test.isNumericArray = test.isArrayOf(Number.isFinite);

var tree = {};


class Tree {
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


tree.leaf = class Leaf extends Tree {
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


tree.node = class Node extends Tree {
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
                label: "Numbers",
                test: test.isNumericArray,
                draw: draw.scatter()
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
        throw "Data format not supported"
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

class DataGraphNode {

    constructor(value, child) {
        this.value = value;
        this.child = child; }}


class DataGraph {

    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges; }}


function makeGraph(data) {  // data: Array<Node>, Node: Pair<Int, Array<Node>>
    return new DataGraph(
        data.map(_makeNode),
        []); }

function _makeNode(data) {
    var childGraph = data.children ?
        makeGraph(data.children) : null;

    return new DataGraphNode(
        data.value,
        childGraph); }

var datagraph = {
    makeGraph,
    DataGraph,
    DataGraphNode };

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
exports.dataGraph = datagraph;
exports.router = router;
exports.test = test;
exports.utils = utils;

Object.defineProperty(exports, '__esModule', { value: true });

})));
