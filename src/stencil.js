import figure from "./figure"
import shape from "./shape"
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

    xRange(shape, margin) {
        const nigram = 1.0 - margin;
        return [-0.5 * nigram * shape.x, 0.5 * nigram * shape.x]; }

    yRange(shape, margin) {
        const nigram = 1.0 - margin;
        return [0.5 * nigram * shape.y, -0.5 * nigram * shape.y]; }

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
            y: y(value.y) }; }};


class XYSizeColorStencil extends Stencil {

    nodeSizeLimit(containerShape) {  //TODO: should return an object / shape?
        return Math.min(
            containerShape.x,
            containerShape.y)
            / 25;}

    paint(parentFigure) {
        var self = this;
        var parentShape = parentFigure.shape;
        var margin = 0.1;  //TODO: compute a availableShape (parentShape * margin)
        const dims = self.dims(parentShape, margin);

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

    dims(shape, margin) {  //TODO: just return an object?  //TODO: fix dimension names for this class? -> it's supposed to be simple, not extensible for now
        return [
            this.x(shape, margin),
            this.y(shape, margin),
            this.color(shape, margin),
            this.size(shape, margin)];}

    x(shape, margin) {
        return this.constantScale(0);}

    y(shape, margin) {
        return this.constantScale(0);}

    color(shape, margin) {
        return this.constantScale("black");}

    size(shape, margin) {
        const sizeLimit = this.nodeSizeLimit(shape);
        return this.constantScale(sizeLimit);}}


class Scatter extends XYSizeColorStencil {

    dims(shape, margin) {
        return [
            this.x(shape, margin),
            this.y(shape, margin),
            this.color(shape, margin),
            this.size(shape, margin)];}

    x(shape, margin) {
        const baseRange = this.xRange(shape, margin);
        const radiusLimit = this.nodeSizeLimit(shape);
        return this.linearExtentScale(
            [
                baseRange[0] + radiusLimit,
                baseRange[1] - radiusLimit],
            "x");}

    y(shape, margin) {
        const baseRange = this.yRange(shape, margin);
        const radiusLimit = this.nodeSizeLimit(shape);
        return this.linearExtentScale(
            [
                baseRange[0] - radiusLimit,
                baseRange[1] + radiusLimit],
            "y");}

    size(shape, margin) {
        const radiusLimit = this.nodeSizeLimit(shape);
        return this.linearExtentScale(
            [
                radiusLimit / 2,
                radiusLimit],
            "z");}

    color(shape, margin) {
        return this.linearExtentScale(
            [
                "red",
                "green"],
            "w");}

    subShape(dims, datum) {
        const [x, y, c, s] = dims;
        const subRadius = s(datum.z);
        return new shape.Rectangle(
            2 * subRadius,
            2 * subRadius);}

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

    x(shape, margin) {
        const baseRange = this.xRange(shape, margin);
        const sizeLimit = this.nodeSizeLimit(shape);
        return this.linearExtentScale(
            [
                baseRange[0] + sizeLimit,
                baseRange[1] - sizeLimit],
            "x");}

    y(shape, margin) {
        const baseRange = this.yRange(shape, margin);
        const sizeLimit = this.nodeSizeLimit(shape);
        return this.linearExtentScale(
            [
                baseRange[0] - sizeLimit,
                baseRange[1] + sizeLimit],
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


export default {
    Stencil,
    Scatter,
    Squares }
