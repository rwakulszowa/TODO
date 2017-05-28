var tape = require("tape"),
    splendid = require("../"),
    ct = splendid.canvasTree,
    dg = splendid.dataGraph,
    SimpleRouter = splendid.router.SimpleRouter;


tape("SimpleRouter.buildCanvasTree builds a CanvasTree from a nested DataGraphNode", function(test) {
    const dgTree = new dg.DataGraphNode(
        "root",
        new dg.DataGraph(
            [
                new dg.DataGraphNode(
                    1,
                    null),
                new dg.DataGraphNode(
                    2,
                    null)],
            []))

    test.same(
        SimpleRouter.buildCanvasTree(dgTree),
        new ct.CanvasNode(
            [1, 2],
            splendid.draw.scatter(),
            [
                new ct.CanvasLeaf(),
                new ct.CanvasLeaf()]))

    test.end(); })
