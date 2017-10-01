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

//TODO: some kinda macro / template to automate exports
//TODO: convert to a class with utils for combining multiple tests
const alwaysTrue = () => true;

const dataGraphChildValues = t => dgNode => {
    return dgNode.child &&
        dgNode.child.nodes.map(n => n.value).every(t); };

const isInstance = cls => obj => obj && obj.constructor == cls;

const isBoolean = isInstance(Boolean);

const isNumber = isInstance(Number);

const isString = isInstance(String);

const isArray = isInstance(Array);

const isNull = x => x ===null;

const isUndefined = x => x === undefined;

const isArrayOf = t => arr => {
    return isArray(arr) && arr.every(t); };

const isObject = isInstance(Object);

const isObjectLike = obj => typeof obj === "object";

const isPlainData = obj => {
    const tests = [
        isBoolean,
        isNumber,
        isString,
        isNull,
        isUndefined];
    return tests.some(t => t(obj));};

const hasNKeys = n => o => {
    return isObject(o) &&
        Object.keys(o).length == n; };

const hasKeys = keys => o => {
    const objKeys = new Set(
        Object.keys(o));
    return isObject(o) &&
        keys.every(k => objKeys.has(k)); };

const isDataGraphLeaf = dgNode => !dgNode.child;

const isRawDataGraph = obj => {
    const keys = [
        "value",
        "children",
        "network"];
    return hasNKeys(keys.length)(obj) &&
        hasKeys(keys)(obj); };

const isTree = node => {
    //FIXME: there are many more ways to represent a tree
    const treeKeys = [
        "value",
        "children"];
    return isObject(node) &&
      hasKeys(treeKeys)(node) &&
      isArray(node.children) &&
      node.children.every(isTree); };

var test = {
    alwaysTrue,
    dataGraphChildValues,
    isInstance,
    isBoolean,
    isNumber,
    isString,
    isNull,
    isUndefined,
    isArray,
    isArrayOf,
    isObject,
    isObjectLike,
    isPlainData,
    hasKeys,
    hasNKeys,
    isDataGraphLeaf,
    isRawDataGraph,
    isTree };

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

utils.splitByKeys = function(keys, obj) {
    const [left, right] = [{}, {}];

    Object.keys(obj).forEach(
        key => {
            const value = obj[key];
            keys.includes(key) ?
                left[key] = value :
                right[key] = value; });
    return [
        left,
        right];
};

utils.flattenArray = function(arr) {
    return arr.length == 0
        ? arr
        : arr.reduce(
            (acc, el) => acc.concat(el)); };

//TODO: replace `children` with `neighbours`, rename to graph.js
class Node {
    constructor(value, children) {
        this.value = value;
        this.children = children || [];
    }

    flatten() {

        let flattenArray = arr =>
            arr.length == 0
            ? arr
            : arr.reduce(
                (acc, el) => acc.concat(el));

        function dig(node, depth) {

            let wrappedNode = {  //TODO: NodeWrapped / Result class
                node,
                depth,
                children: node.children };

            let children = utils.flattenArray(
                node.children.map(  // assumes a valid (acyclic) tree
                    child => dig(child, depth + 1)));

            children.unshift(wrappedNode);
            return children; }

        function indexify(wrappedNodes) {  // [{ Node, depth, [Node] }] -> [{ Node, depth, [[indexFrom, indexTo]] }]

            let nodes = wrappedNodes.map(wn => wn.node);

            function indexifySingle(nodeWrapper, index) {
                const { node, depth, children } = nodeWrapper;

                const edges = children.map(
                    node => [
                        index,
                        nodes.indexOf(node)]);

                return {
                    node,
                    depth,
                    edges }; }

            //FIXME: obviously O(n^2), use a Set
            return wrappedNodes.map(indexifySingle); }

        return indexify(
            dig(
                this,
                0)); }}


function buildTree(nodeObj) {
    return new Node(
        nodeObj.value,
        nodeObj.children.map(buildTree)); }


var tree = {
    buildTree,
    Node };

class Pattern {
    constructor(label, test$$1, processor) {
        this.label = label,
        this.test = test$$1,
        this.processor = processor; }

    matches(obj) {
        return this.test(obj); }

    process(key, obj) {
        return new Result(
            this.processor(
              key,
              obj),
            this); }}


class Result {
    constructor(value, pattern) {
        this.value = value,
        this.pattern = pattern; }

    unwrap() {
        return this.value; }}


class SimpleCoercer {  //TODO: subclass router, rename current router to CanvasTreeBuilder?; return datagraphs from here and rename this to dataGraphBuilder?

    patterns() {
        return [

            new Pattern(
                "plainData",
                test.isPlainData,
                (key, obj) => ({
                    value: { x: obj, y: obj },
                    children: [],
                    network: [] })),

            new Pattern(
                "rawDataGraph",
                test.isRawDataGraph,
                (key, obj) => obj),

            new Pattern(
                "treeLike",
                test.isTree,
                treeProcessor),

            new Pattern(
                "objectTree",
                test.isObjectLike,
                objectTree)];}

    _coerce(key, data) {
        const match = this.match(data);
        const result = match.process(key, data);
        return result; }

    coerce(data) {
        return this._coerce(
            "root",
            data).unwrap(); }

    match(data) {
      let self = this;
      const matches = this.patterns().filter(
          pattern => pattern.matches(data));
      if (matches.length > 0) {
          return matches[0] }
      else {
          console.log(`No match for ${JSON.stringify(dataGraphNode, 0, 4)}`);
          return null; }}}


const treeProcessor = makeTreeProcessor(
    (nodeWrapper, index) => (
        {
            value: {
                x: index,
                y: nodeWrapper.depth,
                z: nodeWrapper.node.value,
                w: nodeWrapper.node.value },
            children: [],
            network: [] }));


function makeTreeProcessor(nodeMapper) {  //TODO: consider making this a tree.Node method

    function inner(key, obj) {
        const root = tree.buildTree(obj);
        const flatTree = root.flatten();
        const children = flatTree.map(nodeMapper);
        const network = utils.flattenArray(
            flatTree.map(n => n.edges));

        return {
            value: { x: 0, y: 0 },  //FIXME: use key here
            children,
            network };}

    return inner; }


function objectTree(key, node) {

    function handlePlain(key, datum) {
        let value = Number(key) || 0;  //FIXME: allow non numeric values
        return {
            value,
            children: [] };}

    function handleComplex(key, obj) {  // Object | Array | customObject
        const children = Object.keys(obj).map(
            key => treeify(key, obj[key]));

        return {
            value: Number(key) || 0,
            children }; }

    function treeify(key, value) {
        return test.isPlainData(value)
            ? handlePlain(key, value)
            : handleComplex(key, value); }

    const tree$$1 = treeify(key, node);

    return treeProcessor(key, tree$$1); }


var coercer = {
    SimpleCoercer };

class Shape {

    inner(target) {
        return handleByClass(
            this._inner_handlers(),
            target)}

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

    scale(factor) {
        return new Rectangle(
            factor * this.x,
            factor * this.y);}

    _inner_handlers() {
        const self = this;
        return [
            [
                Rectangle,
                () => new Rectangle(
                    self.x,
                    self.y)],
            [
                Circle,
                () => new Circle(
                    Math.min(
                        this.x,
                        this.y)
                    / 2)]];}}


class Circle extends Shape {

    constructor(r) {
        super();
        this.r = r; }

    scale(factor) {
        return new Circle(factor * this.r);}

    _inner_handlers() {
        const self = this;
        return [
            [
                Circle,
                () => new Circle(self.r)],
            [
                Rectangle,
                () => new Rectangle(
                    self.r * Math.sqrt(2),
                    self.r * Math.sqrt(2))]];}}


function handleByClass(pairs, target) {
    function test(pair) {
        const [cls, callback] = pair;
        return cls == target; }
    const [cls, callback] = pairs.find(test);
    return callback();}


var shape = {
    Circle,
    Rectangle };

//TODO: use TypeScript?


class Stencil {

    constructor(data, network, label) {
        this.data = data;
        this.network = network;
        this.label = label; }

    paint(parentFigure) {
    }

    //FIXME: methods that should never get overriden should be free functions, not methods
    path(shapePair) {
        const a = shapePair[0];
        const b = shapePair[1];
        return "M" + a.x + "," + a.y
            + "C" + a.x + "," + (a.y + b.y) / 2
            + " " + b.x + "," + (a.y + b.y) / 2
            + " " + b.x + "," + b.y; }

    translate(x, y) {
        return "translate(" + x + "," + y + ")"; }

    xRange(size) {
        return [
            -0.5 * size,
            0.5 * size]; }

    yRange(size) {
        return [
            0.5 * size,
            -0.5 * size]; }

    constantScale(value) {  //NOTE: this returns a function, not a scale -> do it properly if possible
        const scale = d3.scaleLinear()
            .range([value, value]);
        return value => scale(
            this.deweirdify(value)); }

    deweirdify(value) {
        return typeof value === "undefined"
            || Number.isNaN(value) ? 0 : value; }

    linearExtentScale(range, key) {
        return d3.scaleLinear()
            .range(range)
            .domain(
                d3.extent(
                    this.data.map(d => d[key])));}

    getNodeCenter(index, dims) {
        const [x, y] = dims;
        const value = this.data[index];
        return {
            x: x(value.x),
            y: y(value.y) }; }}


class XYSizeColorStencil extends Stencil {

    paint(parentFigure) {
        var self = this;
        var parentShape = parentFigure.shape.inner(
            self.parentShapeClass());
        var margin = 0.1;
        var availableShape = parentShape.scale(1 - margin);
        const dims = self.dims(availableShape);

        var chart = parentFigure.selection
            .append("g")
                .attr("class", "chart");

        var nodeG = chart
            .selectAll(".node")
                .data(self.data)
            .enter()
            .append("g")
                .attr("class", "node");

        const nAttributes = self.nodeAttributes(dims);

        for (let pair of nAttributes) {  //TODO: move to a method, do it the d3 way
            const [key, value] = pair;
            if (key == "class") {
                console.log("Ignoring class attribute for node");}
            else {
                nodeG.attr(key, value);}}

        self.nodeFunction(
            nodeG,
            dims);

        var subSelections = nodeG.nodes()
            .map(d3.select);

        var subShapes = self.data
            .map(d => self.subShape(dims, d));

        //TODO: zip subShapes with offsets

        var edgeData = self.network.map(
            edge => [
                self.getNodeCenter(edge[0], dims),
                self.getNodeCenter(edge[1], dims)]);

        var edge = chart
            .selectAll(".edge")
                .data(edgeData)
            .enter().append("path")
                .attr("class", "edge")
                .attr("d", self.path);

        // TODO: return edges as well

        return subSelections.map(
            (sel, i) => new figure.Figure(subShapes[i], sel)); }

    dims(shape$$1) {  //TODO: just return an object?  //TODO: fix dimension names for this class? -> it's supposed to be simple, not extensible for now
        return [
            this.x(shape$$1),
            this.y(shape$$1),
            this.color(shape$$1),
            this.size(shape$$1)];}

    x(shape$$1) {
        return this.constantScale(0);}

    y(shape$$1) {
        return this.constantScale(0);}

    color(shape$$1) {
        return this.constantScale("black");}

    size(shape$$1) {
        const sizeLimit = this.nodeSizeLimit(shape$$1);
        return this.constantScale(sizeLimit);}}


class Scatter extends XYSizeColorStencil {

    parentShapeClass() {  //FIXME: this should be a param accessible by caller (CanvasTree); it should handle transforming parent's shape
        return shape.Circle; }

    nodeSizeLimit(containerShape) {
        return containerShape.r
          / this.data.length; }

    x(shape$$1) {
        const radiusLimit = this.nodeSizeLimit(shape$$1);
        const range = this.xRange(
            2 * (shape$$1.r - 2 * radiusLimit));
        return this.linearExtentScale(
            range,
            "x");}

    y(shape$$1) {
        const radiusLimit = this.nodeSizeLimit(shape$$1);
        const range = this.yRange(
            2 * (shape$$1.r - 2 * radiusLimit));
        return this.linearExtentScale(
            range,
            "y");}

    size(shape$$1) {
        const radiusLimit = this.nodeSizeLimit(shape$$1);
        return this.linearExtentScale(
            [
                radiusLimit / 2,
                radiusLimit],
            "z");}

    color(shape$$1) {
        return this.linearExtentScale(
            [
                "red",
                "green"],
            "w");}

    subShape(dims, datum) {
        const [x, y, c, s] = dims;
        const subRadius = s(datum.z);
        return new shape.Circle(subRadius);}

    nodeAttributes(dims) {  //FIXME: is this necessary? shouldn't it always be default?
        const [x, y] = dims;
        return [
            [
                "transform",
                d => this.translate(
                    x(d.x),
                    y(d.y))]];}

    nodeFunction(node, dims) {
        const [x, y, c, s] = dims;
        node.append("circle")
            .attr("r", d => s(d.z))
            .style("stroke", d => c(d.w));}}


class Squares extends XYSizeColorStencil {

    parentShapeClass() {
        return shape.Rectangle; }

    nodeSizeLimit(containerShape) {
        return Math.min(
            containerShape.x,
            containerShape.y)
            / 2
            / this.data.length;}

    x(shape$$1) {
        const sizeLimit = this.nodeSizeLimit(shape$$1);
        const range = this.xRange(
            shape$$1.x - 2 * sizeLimit);
        return this.linearExtentScale(
            range,
            "x");}

    y(shape$$1) {
        const sizeLimit = this.nodeSizeLimit(shape$$1);
        const range = this.yRange(
            shape$$1.y - 2 * sizeLimit);
        return this.linearExtentScale(
            range,
            "y");}

    subShape(dims, datum) {
        const [x, y, c, s] = dims;
        const subSize = s(datum.z);
        return new shape.Rectangle(
            2 * subSize,
            2 * subSize);}

    nodeAttributes(dims) {  //FIXME: is this necessary? shouldn't it always be default?
        const [x, y] = dims;
        return [
            [
                "transform",
                d => this.translate(
                    x(d.x),
                    y(d.y))]];}

    nodeFunction(node, dims) {
        const [x, y, c, s] = dims;
        node.append("rect")
            .attr(
                "transform",
                d =>
                    this.translate(
                        -s(d.z),
                        -s(d.z)))
            .attr("width", d => 2 * s(d.z))
            .attr("height", d => 2 * s(d.z));}}


var stencil = {
    Stencil,
    Scatter,
    Squares };

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
            childrenPaintings); }


    coerce() {  //TODO: return a coercer test + processor?
        return {
            value: 1,  //TODO: return more specific data
            children: this.children.map(c => c.coerce())};}}


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
            container)}

    coerce() {
        return {
            value: 0,
            children: []};}}


var canvasTree = {
    CanvasNode,
    CanvasLeaf };

class SimpleRouter {

    patterns() {
        return [
            {
                label: "Nil",
                test: test.isDataGraphLeaf,
                stencil: null },
            {
                label: "Numbers",
                test: test.dataGraphChildValues(
                    test.hasNKeys(2)),
                stencil: stencil.Squares },
            {
                label: "Scatter",
                test: test.dataGraphChildValues(
                    test.hasNKeys(4)),
                stencil: stencil.Scatter }]; }  //TODO: use functions as stencils, not classes

    route(dataGraphNode) {
        const matches = this.patterns().filter(
            pattern => pattern.test(dataGraphNode));
        if (matches.length > 0) {
            return matches[0] }
        else {
            console.log(`No match for ${JSON.stringify(dataGraphNode, 0, 4)}`);
            return null; }}

    buildCanvasTree(dataGraphNode) {
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

function show(data, rootFigure, routerInstance, coercerInstance) {
    rootFigure = rootFigure || bodyFigure();
    routerInstance = routerInstance || new router.SimpleRouter();
    coercerInstance = coercerInstance || new coercer.SimpleCoercer();

    const coercedData = coercerInstance.coerce(data);
    const graph = dataGraph.makeNode(coercedData);
    const canvasTree = routerInstance.buildCanvasTree(graph);  //FIXME: router should have access to figure
    const paintingTree = canvasTree.paint(rootFigure);
    return paintingTree; }


function bodyFigure() {
    const rootShape = new shape.Rectangle(
        860,
        640);
    const container = d3.select("body")
        .append("svg")
            .attr("width", rootShape.x)
            .attr("height", rootShape.y)
        .append("g")
            .attr("transform", `translate(${rootShape.x / 2}, ${rootShape.y / 2})`);
    return new figure.Figure(
        rootShape,
        container);}

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
exports.coercer = coercer;
exports.tree = tree;

Object.defineProperty(exports, '__esModule', { value: true });

})));
