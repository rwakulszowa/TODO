class PaintingTree {

    dumps() {  //TODO: move to utils
        return JSON.stringify(
            this,
            null,
            2); }};


class PaintingNode extends PaintingTree {

    constructor(canvasNode, container, shape, children) {  //TODO: Painting class (container + shape + some magic)
        super();
        this.canvasNode = canvasNode;
        this.container = container;
        this.shape = shape;
        this.children = children; }}


class PaintingLeaf extends PaintingTree {

    constructor(canvasNode, container) {
        super();
        this.canvasNode = canvasNode;
        this.container = container;
        this.shape = null;
        this.children = []; }}


export default {
    PaintingNode,
    PaintingLeaf };
