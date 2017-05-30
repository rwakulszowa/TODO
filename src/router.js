import stencil from "./stencil"
import test from "./test"
import canvasTree from "./canvastree"


class SimpleRouter {

    static patterns() {
        return [
            {
                label: "Numbers",
                test: test.alwaysTrue,
                stencil: stencil.Scatter }]; }

    static route(dataGraphNode) {
        return this.patterns()[0].stencil; }  //FIXME: actually do something useful here

    static buildCanvasTree(dataGraphNode) {
        if (dataGraphNode.child) {
            const data = dataGraphNode.child.nodes.map(n => n.value);
            const canvas = this.route(dataGraphNode);
            const children = dataGraphNode.child.nodes.map(this.buildCanvasTree);
            return new canvasTree.CanvasNode(
                data,
                canvas,
                children); }
        else {
            return new canvasTree.CanvasLeaf(); }}}


export default {
    SimpleRouter };
