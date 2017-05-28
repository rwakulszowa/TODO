class CanvasTree {

    dumps() {
        return JSON.stringify(
            this,
            null,
            2); }};


class CanvasNode extends CanvasTree {

    constructor(data, stencil, children) {
        super();
        this.data = data;
        this.stencil = stencil;
        this.children = children; }}


class CanvasLeaf extends CanvasTree {

    constructor() {
        super();
        this.data = null;
        this.stencil = null;
        this.children = []; }}


export default {
    CanvasNode,
    CanvasLeaf };
