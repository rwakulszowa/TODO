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
            .domain(d3.extent(self.data.map(d => d.x)));

        var baseYRange = self.yRange(parentShape, margin);
        var y = d3.scaleLinear()
            .range([baseYRange[0] - radius, baseYRange[1] + radius])
            .domain(d3.extent(self.data.map(d => d.y)));  //TODO: key / accessor  //TODO: utils / local cache for unwrapped arrays?

        var r = d3.scaleLinear()
            .range([radius / 2, radius])
            .domain(d3.extent(self.data.map(d => d.z)));

        var c = d3.scaleLinear()
            .range(["red", "green"])
            .domain(d3.extent(self.data.map(d => d.w)));

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
                    d =>
                        self.translate(
                            x(d.x),
                            y(d.y)));

        dotG.append("circle")
            .attr("r", d => r(d.z))
            .style("stroke", d => c(d.w));

        var subSelections = dotG.nodes()
            .map(d3.select);

        var subShapes = self.data
            .map(d => {
                const elementRadius = r(d.z);
                return new shape.Rectangle(  //FIXME: return circles here
                    2 * elementRadius,
                    2 * elementRadius);});

        function getNodeCenter(index) {
            const value = self.data[index];
            const shape = subShapes[index];
            return {
                x: x(value.x),
                y: y(value.y) }; }

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
