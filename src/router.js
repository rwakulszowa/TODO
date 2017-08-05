import stencil from "./stencil"
import test from "./test"
import canvasTree from "./canvastree"


class SimpleRouter {

    static patterns() {
        return [
            {
                label: "Nil",
                test: test.isDataGraphLeaf,
                stencil: null },
            {
                label: "Numbers",
                test: test.dataGraphChildValues(
                    test.hasNKeys(2)),
                stencil: stencil.Squares },
            {
                label: "Scatter",
                test: test.dataGraphChildValues(
                    test.hasNKeys(4)),
                stencil: stencil.Scatter }]; }

    static route(dataGraphNode) {
        const matches = this.patterns().filter(
            pattern => pattern.test(dataGraphNode));
        if (matches.length > 0) {
            return matches[0] }
        else {
            console.log(`No match for ${JSON.stringify(dataGraphNode, 0, 4)}`);
            return null; }}

    static buildCanvasTree(dataGraphNode) {
        const match = this.route(dataGraphNode);
        if (match && dataGraphNode.child) {
            const data = dataGraphNode.child.nodes.map(n => n.value);
            const network = dataGraphNode.child.edges;
            const children = dataGraphNode.child.nodes.map(
                this.buildCanvasTree,
                this);
            return new canvasTree.CanvasNode(
                data,
                network,
                match.stencil,
                children); }
        else {
            return new canvasTree.CanvasLeaf(); }}}


export default {
    SimpleRouter };
