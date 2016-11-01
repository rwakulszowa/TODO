var Segment = function(area, size, offset) {
	this.area = area;
	this.size = size;
	this.offset = offset;
	this.id = "seg" + Math.round(Math.random() * 100);
}


Segment.prototype.split = function(xDivs, yDivs) {
    var width = this.size.x / xDivs;
    var height = this.size.y / yDivs;

    // 2D Array of shape [xDivs, yDivs]
    var ans = new Array(xDivs).fill(0).map(
        function() { return new Array(yDivs).fill(0); });

    return ans.map(
        function(row, i) {
            return row.map(
                function(cell, j) {
                    return new Segment(
                        this.area,
                        { x: width, y: height },
                        { x: i * width + this.offset.x, y: j * height + this.offset.y }) },
                this) },
            this);
}
