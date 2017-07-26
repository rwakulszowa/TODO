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
        return [0.5 * nigram * shape.y, -0.5 * nigram * shape.y]; } };


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
            const shape = subShapes[index];
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


export default {
    Stencil,
    Scatter }
