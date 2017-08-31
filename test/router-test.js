var tape = require("tape"),
    splendid = require("../"),
    ct = splendid.canvasTree,
    dg = splendid.dataGraph,
    SimpleRouter = splendid.router.SimpleRouter;


tape("SimpleRouter.buildCanvasTree builds a CanvasTree from a nested DataGraphNode", function(test) {
    const router = new SimpleRouter();
    const dgTree = new dg.DataGraphNode(
        {},
        new dg.DataGraph(
            [
                new dg.DataGraphNode(
                    { x: 1, y: 1, z: 1, w: 1 },
                    null),
                new dg.DataGraphNode(
                    { x: 2, y: 2, z: 2, w: 2 },
                    null)],
            []));

    test.same(
        router.buildCanvasTree(dgTree),
        new ct.CanvasNode(
            [
                { x: 1, y: 1, z: 1, w: 1 },
                { x: 2, y: 2, z: 2, w: 2 }],
            [],
            splendid.stencil.Scatter,
            [
                new ct.CanvasLeaf(),
                new ct.CanvasLeaf()]))

    test.end(); })
