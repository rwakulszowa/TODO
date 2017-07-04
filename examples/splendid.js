(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.splendid = global.splendid || {})));
}(this, (function (exports) { 'use strict';

//TODO: use TypeScript?
class Stencil {

    constructor(data, network, label) {
        this.data = data;
        this.network = network;
        this.label = label; }

    // sel: d3.selection
    // shape: {x: Number, y: Number}
    // returns: {<d3.selection>, <{x: Number, y: Number}>}
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
            .domain([0, self.data.length - 1]);

        var baseYRange = self.yRange(shape, margin);
        var y = d3.scaleLinear()
            .range([baseYRange[0] - radius, baseYRange[1] + radius])
            .domain(d3.extent(self.data));

        var dotG = sel
            .append("g")
                .attr("class", "chart")
            .selectAll("circle")
                .data(self.data)
            .enter()
            .append("g")
                .attr("class", "dot")
                .attr(
                    "transform",
                    (d, i) => self.translate(
                        x(i),
                        y(d)));

        dotG.append("circle")
            .attr("cx", radius)
            .attr("cy", radius)
            .attr("r", radius);

        var subSelections = dotG.nodes().map(d3.select);
        var subShapes = Array(subSelections.length).fill(
            {
                x: 2 * radius,
                y: 2 * radius });

        return {
            subSelections,
            subShapes };
      }}


var stencil = {
    Stencil,
    Scatter };

function alwaysTrue() {
    return true; }

var test = {
    alwaysTrue };

class PaintingTree {

    dumps() {  //TODO: move to utils
        return JSON.stringify(
            this,
            null,
            2); }}


class PaintingNode extends PaintingTree {

    constructor(canvasNode, container, shape, children) {  //TODO: Painting class (container + shape + some magic)
        super();
        this.canvasNode = canvasNode;
        this.container = container;
        this.shape = shape;
        this.children = children; }}


class PaintingLeaf extends PaintingTree {

    constructor(canvasNode, container) {
        super();
        this.canvasNode = canvasNode;
        this.container = container;
        this.shape = null;
        this.children = []; }}


var paintingTree = {
    PaintingNode,
    PaintingLeaf };

class CanvasTree {

    dumps() {
        return JSON.stringify(
            this,
            null,
            2); }}


class CanvasNode extends CanvasTree {

    constructor(data, network, stencil, children) {
        super();
        this.data = data;
        this.network = network;
        this.stencil = stencil;
        this.children = children; }

    paint(container, shape) {
        const stencilInstance = new this.stencil(
            this.data,
            this.network,
            "notUsed");
        const childrenCount = this.children.length;
        const painted = stencilInstance.paint(
            container,
            shape);
        const subContainers = painted.subSelections;
        const subShapes = painted.subShapes;

        if (childrenCount != subContainers.length) {
            console.log("childrenCount != subContainers.length: " + childrenCount + ', ' + subContainers.length); }

        const childrenPaintings = this.children.map(
            (node, index) =>
                node.paint(
                    subContainers[index],
                    subShapes[index]));

        return new paintingTree.PaintingNode(
            this,
            container,
            shape,
            childrenPaintings); }}


class CanvasLeaf extends CanvasTree {

    constructor() {
        super();
        this.data = null;
        this.network = null;
        this.stencil = null;
        this.children = []; }

    paint(container, shape) {
        return new paintingTree.PaintingLeaf(
            this,
            container)}}


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
        const matches = this.patterns().filter(
            pattern => pattern.test(dataGraphNode));
        return matches[0].stencil; }

    static buildCanvasTree(dataGraphNode) {
        if (dataGraphNode.child) {
            const canvas = this.route(dataGraphNode);
            const data = dataGraphNode.child.nodes.map(n => n.value);
            const network = dataGraphNode.child.edges;
            const children = dataGraphNode.child.nodes.map(
                this.buildCanvasTree,
                this);
            return new canvasTree.CanvasNode(
                data,
                network,
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


function makeGraph(nodes, edges) {
    return new DataGraph(
        nodes.map(makeNode),
        edges); }


function makeNode(data) {
    var childGraph =
        data.children ?
            makeGraph(
                data.children,
                data.network) :
            null;

    return new DataGraphNode(
        data.value,
        childGraph); }


var dataGraph = {
    makeGraph,
    makeNode,
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

function show(data, size, rootContainer) {
    size = size || { x: 860, y: 640 };
    rootContainer = rootContainer || d3.select("body");

    const container = rootContainer
        .append("svg")
  	        .attr("width", size.x)
  	        .attr("height", size.y);

    const graph = dataGraph.makeNode(data);
    const routerCls = router.SimpleRouter;
    const canvasTree = routerCls.buildCanvasTree(graph);
    const paintingTree = canvasTree.paint(container, size);
    return paintingTree; }

exports.show = show;
exports.stencil = stencil;
exports.dataGraph = dataGraph;
exports.canvasTree = canvasTree;
exports.paintingTree = paintingTree;
exports.router = router;
exports.test = test;
exports.utils = utils;

Object.defineProperty(exports, '__esModule', { value: true });

})));
