var tape = require("tape"),
    splendid = require("../"),
    ct = splendid.canvasTree,
    dg = splendid.dataGraph,
    SimpleRouter = splendid.router.SimpleRouter;


tape("SimpleRouter.buildCanvasTree builds a CanvasTree from a nested DataGraphNode", function(test) {
    const dgTree = new dg.DataGraphNode(
        {},
        new dg.DataGraph(
            [
                new dg.DataGraphNode(
                    { x: 1 },
                    null),
                new dg.DataGraphNode(
                    { x: 2 },
                    null)],
            []));

    test.same(
        SimpleRouter.buildCanvasTree(dgTree),
        new ct.CanvasNode(
            [
                { x: 1 },
                { x: 2 }],
            [],
            splendid.stencil.Scatter,
            [
                new ct.CanvasLeaf(),
                new ct.CanvasLeaf()]))

    test.end(); })
