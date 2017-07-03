import paintingTree from "./paintingtree"


class CanvasTree {

    dumps() {
        return JSON.stringify(
            this,
            null,
            2); }};


class CanvasNode extends CanvasTree {

    constructor(data, network, stencil, children) {
        super();
        this.data = data;
        this.network = network;
        this.stencil = stencil;
        this.children = children; }

    paint(container, shape) {
        const stencilInstance = new this.stencil(
            this.data,
            this.network,
            "notUsed");
        const subContainers = stencilInstance.paint(
            container,
            shape);
        const childrenCount = this.children.length;

        if (childrenCount != subContainers.length) {
            console.log("childrenCount != subContainers.length: " + childrenCount + ', ' + subContainers.length); }

        const subShape = {  //FIXME: get shapes from stencil.paint()
            x: shape.x / childrenCount / 5,
            y: shape.y / childrenCount / 5};
        const childrenPaintings = this.children.map(
            (node, index) =>
                node.paint(
                    subContainers[index],
                    subShape));

        return new paintingTree.PaintingNode(
            this,
            container,
            shape,
            childrenPaintings); }}


class CanvasLeaf extends CanvasTree {

    constructor() {
        super();
        this.data = null;
        this.network = null;
        this.stencil = null;
        this.children = []; }

    paint(container, shape) {
        return new paintingTree.PaintingLeaf(
            this,
            container)}}


export default {
    CanvasNode,
    CanvasLeaf };
