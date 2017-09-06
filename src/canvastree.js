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

    paint(figure) {
        const stencilInstance = new this.stencil(
            this.data,
            this.network,
            "notUsed");
        const childrenCount = this.children.length;
        const subFigures = stencilInstance.paint(figure);

        if (childrenCount != subFigures.length) {
            console.log("childrenCount != subFigures.length: " + childrenCount + ', ' + subFigures.length); }

        const childrenPaintings = this.children.map(
            (node, index) =>  //TODO: just use lodash
                node.paint(subFigures[index]));

        return new paintingTree.PaintingNode(
            this,
            figure,
            childrenPaintings); }


    coerce() {  //TODO: return a coercer test + processor?
        return {
            value: 1,  //TODO: return more specific data
            children: this.children.map(c => c.coerce())};}}


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
            container)}

    coerce() {
        return {
            value: 0,
            children: []};}}


export default {
    CanvasNode,
    CanvasLeaf };
