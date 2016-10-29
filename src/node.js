var Node = function(input, output, children) {
	this.input = input;
	this.output = output;
	this.children  = children;
}

Node.prototype.shape = function() {
	var defaultShape = { x: 1, y: 2 };
	var children = this.children.map(function(node) {
		return node.shape();
	});

	var totalX = children.reduce(function(acc, shape) {
		return Math.max(acc, shape.x);
	}, 0) + defaultShape.x;
	
	var totalY = children.reduce(function(acc, shape) {
		return acc + shape.y;
	}, defaultShape.y);

	return { x: totalX, y: totalY };
}
