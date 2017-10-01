var tape = require("tape"),
    splendid = require("../");
    tree = splendid.tree;


tape("Node flattens itself", function(test) {
    const node = new tree.Node(1);

    test.same(
        node.flatten(),
        [{
            node,
            depth: 0,
            edges: []}]);

    test.end(); })

tape("Node flattens a non trivial tree", function(test) {
    const children = [2, 3].map(x => new tree.Node(x));
    const node = new tree.Node(
        1,
        children);

    test.same(
        node.flatten(),
        [
            {
                node,
                depth: 0,
                edges: [
                    [0, 1],
                    [0, 2]] },
            {
                node: children[0],
                depth: 1,
                edges: [] },
            {
                node: children[1],
                depth: 1,
                edges: [] }]);

    test.end(); })

tape("tree.buildTree builds a simple tree", function(test) {
    const data = {
        value: 1,
        children: []};

    test.same(
        tree.buildTree(data),
        new tree.Node(1));

    test.end(); })

tape("tree.buildTree builds a less simple tree", function(test) {
    const data = {
        value: 1,
        children: [
            {
                value: 2,
                children: []}]};

    test.same(
        tree.buildTree(data),
        new tree.Node(
            1,
            [new tree.Node(2)]));

    test.end(); })
