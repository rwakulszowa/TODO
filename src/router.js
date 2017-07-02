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
        const matches = this.patterns().filter(
            pattern => pattern.test(dataGraphNode));
        return matches[0].stencil; }

    static buildCanvasTree(dataGraphNode) {
        if (dataGraphNode.child) {
            const canvas = this.route(dataGraphNode);
            const data = dataGraphNode.child.nodes.map(n => n.value);
            const network = dataGraphNode.child.edges;
            const children = dataGraphNode.child.nodes.map(this.buildCanvasTree);
            return new canvasTree.CanvasNode(
                data,
                network,
                canvas,
                children); }
        else {
            return new canvasTree.CanvasLeaf(); }}}


export default {
    SimpleRouter };
