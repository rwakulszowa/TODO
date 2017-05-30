(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.splendid = global.splendid || {})));
}(this, (function (exports) { 'use strict';

class Stencil {

    constructor(data, label) {
        this.data = data;
        this.label = label; }

    paint(sel, shape) {
    }

    minDimension(shape) {
        return Math.min(shape.x, shape.y); }

    path(a, b) {
        return "M" + a.x + "," + a.y
            + "C" + a.x + "," + (a.y + b.y) / 2
            + " " + b.x + "," + (a.y + b.y) / 2
            + " " + b.x + "," + b.y; }

    translate(x, y) {
        return "translate(" + x + "," + y + ")"; }

    chart(sel, shape, margin) {
        return sel.append("g")
            .attr("class", "chart")
            .attr("transform", this.translate(margin * shape.x, margin * shape.y)); }

    xRange(shape, margin) {
        return [margin * shape.x, (1 - margin) * shape.x]; }

    yRange(shape, margin) {
        return [(1 - margin) * shape.y, margin * shape.y]; } }


class Scatter extends Stencil {

    paint(sel, shape) {
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

        return circle.nodes(); }}


var stencil = {
    Stencil,
    Scatter };

function alwaysTrue() {
    return true; }

var test = {
    alwaysTrue };

class CanvasTree {

    dumps() {
        return JSON.stringify(
            this,
            null,
            2); }}


class CanvasNode extends CanvasTree {

    constructor(data, stencil, children) {
        super();
        this.data = data;
        this.stencil = stencil;
        this.children = children; }}


class CanvasLeaf extends CanvasTree {

    constructor() {
        super();
        this.data = null;
        this.stencil = null;
        this.children = []; }}


var canvasTree = {
    CanvasNode,
    CanvasLeaf };

class SimpleRouter {

    static patterns() {
        return [
            {
                label: "Numbers",
                test: test.alwaysTrue,
                stencil: stencil.Scatter }]; }

    static route(dataGraphNode) {
        return this.patterns()[0].stencil; }  //FIXME: actually do something useful here

    static buildCanvasTree(dataGraphNode) {
        if (dataGraphNode.child) {
            const data = dataGraphNode.child.nodes.map(n => n.value);
            const canvas = this.route(dataGraphNode);
            const children = dataGraphNode.child.nodes.map(this.buildCanvasTree);
            return new canvasTree.CanvasNode(
                data,
                canvas,
                children); }
        else {
            return new canvasTree.CanvasLeaf(); }}}


var router = {
    SimpleRouter };

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
        []); }  //FIXME: allow edges

function _makeNode(data) {
    var childGraph =
        data.children ?
            makeGraph(data.children) :
            null;

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

function show(data, size, container) {
    size = size || { x: 860, y: 640 };
    container = container || d3.select("body")
	  .append("svg")
	    .attr("width", size.x)
	    .attr("height", size.y);

    const routerCls = router.SimpleRouter;
    const tree = routerCls.buildCanvasTree(data);
    // tree.paint(container, size);//TODO
}

exports.show = show;
exports.stencil = stencil;
exports.dataGraph = datagraph;
exports.canvasTree = canvasTree;
exports.router = router;
exports.test = test;
exports.utils = utils;

Object.defineProperty(exports, '__esModule', { value: true });

})));
