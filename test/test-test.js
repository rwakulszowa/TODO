var tape = require("tape"),
    splendid = require("../"),
    splendidTest = splendid.test;


tape("hasKeys returns true when keys are present", function(test) {
    const keys = [
        "a",
        "b"];

    const obj = {
        a: 1,
        b: 2,
        c: 3 };

    test.true(
        splendidTest.hasKeys(keys)(obj));
    test.end(); })

tape("hasKeys returns false when keys are absent", function(test) {
    const keys = [
        "a",
        "b"];

    const obj = { a: 1 };

    test.false(
        splendidTest.hasKeys(keys)(obj));
    test.end(); })

tape("isTree returns true for a linked list with explicit empty children", function(test) {
    const tree = {
        value: 1,
        children: [{
            value: 2,
            children: [] }]};

    test.true(
        splendidTest.isTree(tree));
    test.end(); })
