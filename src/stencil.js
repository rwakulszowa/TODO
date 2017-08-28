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
            y: y(value.y) }; }};


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

    dims(shape) {  //TODO: just return an object?  //TODO: fix dimension names for this class? -> it's supposed to be simple, not extensible for now
        return [
            this.x(shape),
            this.y(shape),
            this.color(shape),
            this.size(shape)];}

    x(shape) {
        return this.constantScale(0);}

    y(shape) {
        return this.constantScale(0);}

    color(shape) {
        return this.constantScale("black");}

    size(shape) {
        const sizeLimit = this.nodeSizeLimit(shape);
        return this.constantScale(sizeLimit);}}


class Scatter extends XYSizeColorStencil {

    parentShapeClass() {  //FIXME: this should be a param accessible by caller (CanvasTree); it should handle transforming parent's shape
        return shape.Circle; }

    nodeSizeLimit(containerShape) {
        return containerShape.r
          / this.data.length; }

    x(shape) {
        const radiusLimit = this.nodeSizeLimit(shape);
        const range = this.xRange(
            2 * (shape.r - 2 * radiusLimit));
        return this.linearExtentScale(
            range,
            "x");}

    y(shape) {
        const radiusLimit = this.nodeSizeLimit(shape);
        const range = this.yRange(
            2 * (shape.r - 2 * radiusLimit));
        return this.linearExtentScale(
            range,
            "y");}

    size(shape) {
        const radiusLimit = this.nodeSizeLimit(shape);
        return this.linearExtentScale(
            [
                radiusLimit / 2,
                radiusLimit],
            "z");}

    color(shape) {
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

    x(shape) {
        const sizeLimit = this.nodeSizeLimit(shape);
        const range = this.xRange(
            shape.x - 2 * sizeLimit);
        return this.linearExtentScale(
            range,
            "x");}

    y(shape) {
        const sizeLimit = this.nodeSizeLimit(shape);
        const range = this.yRange(
            shape.y - 2 * sizeLimit);
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


export default {
    Stencil,
    Scatter,
    Squares }
