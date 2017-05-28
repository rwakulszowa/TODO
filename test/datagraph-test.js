var tape = require("tape"),
    splendid = require("../"),
    dg = splendid.dataGraph;

tape("dataGraph.makeGraph makes from simple data", function(test) {
    var data = [
        {
            value: 1,
            children: null }];

    test.same(
        dg.makeGraph(data),
        new dg.DataGraph(
            [
                new dg.DataGraphNode(
                    1,
                    null)],
            []));

    test.end();
})

tape("dataGraph.makeGraph makes from nested data", function(test) {
    var data = [
        {
            value: 1,
            children: [
                { value: 1, children: null },
                { value: 2, children: null }]}];

    test.same(
        dg.makeGraph(data),
        new dg.DataGraph(
            [
                new dg.DataGraphNode(
                    1,
                    new dg.DataGraph(
                        [
                            new dg.DataGraphNode(
                                1,
                                null),
                            new dg.DataGraphNode(
                                2,
                                null)],
                        []))],
            []));
    test.end();
})
