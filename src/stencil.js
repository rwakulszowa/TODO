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
        return [(1 - margin) * shape.y, margin * shape.y]; } };


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

        var dotG = self.chart(sel, shape, margin)
            .selectAll("circle")
                .data(self.data)
            .enter()
            .append("g")
                .attr("class", "dot")
                .attr("transform", function(d, i) {
                    return self.translate(
                        x(i) - radius / 2,
                        y(d) - radius / 2) });

        dotG.append("circle")
            .attr("cx", radius / 2)
            .attr("cy", radius / 2)
            .attr("r", radius);

        return dotG.nodes(); }}


export default {
    Stencil,
    Scatter }
