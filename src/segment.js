var Segment = function(area, size, offset) {
	this.area = area;
	this.size = size;
	this.offset = offset;
	this.id = "seg" + Math.round(Math.random() * 100);
}


Segment.prototype.vSplit = function(divs) {
    var width = this.size.x / divs;

    return new Array(divs).fill(0).map(
        function(el, i) {
            return new Segment(
                    this.area,
                    { x: width, y: this.size.y },
                    { x: i * width + this.offset.x, y: this.offset.y }); },
            this);
}


Segment.prototype.hSplit = function(divs) {
    var height = this.size.y / divs;

    return new Array(divs).fill(0).map(
        function(el, i) {
            return new Segment(
                    this.area,
                    { x: this.size.x, y: height },
                    { x: this.offset.x, y: i * height + this.offset.y }); },
            this);
}
