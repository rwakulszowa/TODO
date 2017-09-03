var tape = require("tape"),
    splendid = require("../"),
    utils = splendid.utils;


tape("splitByKeys... splits by keys", function(test) {
    const keys = [
        "a",
        "b"];

    const obj = {
        a: 1,
        b: 2,
        c: 3 };

    const split = utils.splitByKeys(
        keys,
        obj);

    test.same(
        split,
        [
            {
                a: 1,
                b: 2 },
            { c: 3 }]);
    test.end(); })
