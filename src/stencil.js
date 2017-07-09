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
        return [margin * shape.x, (1 - margin) * shape.x]; }

    yRange(shape, margin) {
        return [(1 - margin) * shape.y, margin * shape.y]; } };


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

        var chart = sel
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
            .attr("cx", radius)
            .attr("cy", radius)
            .attr("r", radius);

        var edgeData = self.network.map(edge => {  //TODO: Shape / Figure classes, move this logic to a method
            const sourceIndex = edge[0];
            const targetIndex = edge[1];
            const sourceValue = self.data[sourceIndex];
            const targetValue = self.data[targetIndex];
            const sourcePosition = {
                x: x(sourceIndex),
                y: y(sourceValue) };
            const targetPosition = {
                x: x(targetIndex),
                y: y(targetValue) };
            return [
              sourcePosition,
              targetPosition]; })

        var edge = chart
            .selectAll(".edge")
                .data(edgeData)
            .enter().append("path")
                .attr("class", "edge")
                .attr("d", self.path);

        var subSelections = dotG.nodes().map(d3.select);
        var subShapes = Array(subSelections.length).fill(
            {
                x: 2 * radius,
                y: 2 * radius });

        // TODO: return nodes as well
        return {
            subSelections,
            subShapes }; }}


export default {
    Stencil,
    Scatter }
