class PaintingTree {

    dumps() {  //TODO: move to utils
        return JSON.stringify(
            this,
            null,
            2); }};


class PaintingNode extends PaintingTree {

    constructor(canvasNode, figure, children) {
        super();
        this.canvasNode = canvasNode;
        this.figure = figure,
        this.children = children; }}


class PaintingLeaf extends PaintingTree {

    constructor(canvasNode, figure) {
        super();
        this.canvasNode = canvasNode;
        this.figure = figure,
        this.children = []; }}


export default {
    PaintingNode,
    PaintingLeaf };
