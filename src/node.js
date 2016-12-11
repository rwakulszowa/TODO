Node.shape = function(node) {
	var defaultShape = { x: 1, y: 2 };
	var children = node.children.map(function(n) {
		return Node.shape(n);
	});

	var totalX = children.reduce(function(acc, shape) {
		return Math.max(acc, shape.x);
	}, 0) + defaultShape.x;
	
	var totalY = children.reduce(function(acc, shape) {
		return acc + shape.y;
	}, defaultShape.y);

	return { x: totalX, y: totalY };
}
