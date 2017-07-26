(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.splendid = global.splendid || {})));
}(this, (function (exports) { 'use strict';

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

class Figure {

    constructor(shape, selection) {
        this.shape = shape;
        this.selection = selection; }

    dumps() {  //TODO: move to utils
        return JSON.stringify(
            this,
            null,
            2); }}

var figure = {
    Figure };

class Shape {

    dumps() {  //TODO: move to utils
        return JSON.stringify(
            this,
            null,
            2); }}


class Rectangle extends Shape {

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y; }

    boundingRectangle() {
        return this; }

    center() {
        return {  //TODO: position class?
            x: this.x / 2,
            y: this.y / 2 }; }}


var shape = {
    Rectangle };

//TODO: use TypeScript?


class Stencil {

    constructor(data, network, label) {
        this.data = data;
        this.network = network;
        this.label = label; }

    paint(parentFigure) {
    }

    path(shapePair) {
        const a = shapePair[0];
        const b = shapePair[1];
        return "M" + a.x + "," + a.y
            + "C" + a.x + "," + (a.y + b.y) / 2
            + " " + b.x + "," + (a.y + b.y) / 2
            + " " + b.x + "," + b.y; }

    translate(x, y) {
        return "translate(" + x + "," + y + ")"; }

    xRange(shape$$1, margin) {
        const nigram = 1.0 - margin;
        return [-0.5 * nigram * shape$$1.x, 0.5 * nigram * shape$$1.x]; }

    yRange(shape$$1, margin) {
        const nigram = 1.0 - margin;
        return [0.5 * nigram * shape$$1.y, -0.5 * nigram * shape$$1.y]; } }


class Scatter extends Stencil {

    paint(parentFigure) {
        var self = this;
        var parentShape = parentFigure.shape;
        var margin = 0.1;
        var radius = Math.min(parentShape.x, parentShape.y) / 25;

        var baseXRange = self.xRange(parentShape, margin);
        var x = d3.scaleLinear()
            .range([baseXRange[0] + radius, baseXRange[1] - radius])
            .domain([0, self.data.length - 1]);

        var baseYRange = self.yRange(parentShape, margin);
        var y = d3.scaleLinear()
            .range([baseYRange[0] - radius, baseYRange[1] + radius])
            .domain(d3.extent(self.data));

        var chart = parentFigure.selection
            .append("g")
                .attr("class", "chart");

        var dotG = chart
            .selectAll(".node")
                .data(self.data)
            .enter()
            .append("g")
                .attr("class", "node")
                .attr(
                    "transform",
                    (d, i) => self.translate(
                        x(i),
                        y(d)));

        dotG.append("circle")
            .attr("r", radius);

        var subSelections = dotG.nodes()
            .map(d3.select);

        var subShapes =  Array(subSelections.length)
            .fill(null)
            .map(
                () =>
                    new shape.Rectangle(
                        2 * radius,
                        2 * radius));

        function getNodeCenter(index) {
            const value = self.data[index];
            const shape$$1 = subShapes[index];
            return {
                x: x(index),
                y: y(value) }; }

        var edgeData = self.network.map(
            edge => [
                getNodeCenter(edge[0]),
                getNodeCenter(edge[1])]);

        var edge = chart
            .selectAll(".edge")
                .data(edgeData)
            .enter().append("path")
                .attr("class", "edge")
                .attr("d", self.path);

        // TODO: return edges as well

        return subSelections.map(
            (sel, i) => new figure.Figure(subShapes[i], sel)); }}


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

    constructor(canvasNode, figure, children) {
        super();
        this.canvasNode = canvasNode;
        this.figure = figure,
        this.children = children; }}


class PaintingLeaf extends PaintingTree {

    constructor(canvasNode, figure) {
        super();
        this.canvasNode = canvasNode;
        this.figure = figure,
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

    paint(figure) {
        const stencilInstance = new this.stencil(
            this.data,
            this.network,
            "notUsed");
        const childrenCount = this.children.length;
        const subFigures = stencilInstance.paint(figure);

        if (childrenCount != subFigures.length) {
            console.log("childrenCount != subFigures.length: " + childrenCount + ', ' + subFigures.length); }

        const childrenPaintings = this.children.map(
            (node, index) =>  //TODO: just use lodash
                node.paint(subFigures[index]));

        return new paintingTree.PaintingNode(
            this,
            figure,
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
        if (matches.length > 0) {
            return matches[0] }
        else {
            console.log(`No match for ${JSON.stringify(dataGraphNode, 0, 4)}`);
            return null; }}

    static buildCanvasTree(dataGraphNode) {
        const match = this.route(dataGraphNode);
        if (match && dataGraphNode.child) {
            const data = dataGraphNode.child.nodes.map(n => n.value);
            const network = dataGraphNode.child.edges;
            const children = dataGraphNode.child.nodes.map(
                this.buildCanvasTree,
                this);
            return new canvasTree.CanvasNode(
                data,
                network,
                match.stencil,
                children); }
        else {
            return new canvasTree.CanvasLeaf(); }}}


var router = {
    SimpleRouter };

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

function show(data, rootFigure) {
    if (!rootFigure) {
        const rootShape = new shape.Rectangle(
            860,
            640);
        const container = d3.select("body")
            .append("svg")
      	        .attr("width", rootShape.x)
      	        .attr("height", rootShape.y)
            .append("g")
                .attr("transform", `translate(${rootShape.x / 2}, ${rootShape.y / 2})`);
        rootFigure = new figure.Figure(
            rootShape,
            container); }

    const graph = dataGraph.makeNode(data);
    const routerCls = router.SimpleRouter;
    const canvasTree = routerCls.buildCanvasTree(graph);
    const paintingTree = canvasTree.paint(rootFigure);
    return paintingTree; }

exports.show = show;
exports.stencil = stencil;
exports.dataGraph = dataGraph;
exports.canvasTree = canvasTree;
exports.paintingTree = paintingTree;
exports.router = router;
exports.test = test;
exports.shape = shape;
exports.figure = figure;
exports.utils = utils;

Object.defineProperty(exports, '__esModule', { value: true });

})));
