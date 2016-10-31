var Segment = function(area, size, offset) {
	this.area = area;
	this.size = size;
	this.offset = offset;
	this.id = "seg" + Math.round(Math.random() * 100);
}

Segment.prototype.vSplit = function() {
	var takenWidth = this.size.x / 2;
	return [new Segment(this.area,
			    { x: this.size.x - takenWidth, y: this.size.y },
			    this.offset),
		new Segment(this.area,
			    { x: takenWidth, y: this.size.y },
			    { x: this.offset.x + takenWidth, y: this.offset.y })];
}
