var test = { };

test.isObject = function(o) {
    return o !== null &&
        !Array.isArray(o) &&
        typeof o === "object";
}

test.hasKeys = function(o, keys) {
    if (test.isObject(o)) {
        var oKeys = Object.keys(o);
        return keys.every(k => oKeys.indexOf(k) != -1);
    } else {
        return false;
    }
}

test.hasExactKeys = function(o, keys) {
    if (test.isObject(o)) {
        var oKeys = Object.keys(o);
        return oKeys.length == keys.length &&
            keys.every(k => oKeys.indexOf(k) != -1);
    } else {
        return false;
    }
}

test.isArrayOf = function(subTest) {
    function inner(data) {
        return Array.isArray(data) &&
            data.every(subTest);
    }
    return inner;
}

test.isNumericArray = test.isArrayOf(Number.isFinite);

test.isExactObjArray = function(keys) {
    return test.isArrayOf(d => test.hasExactKeys(d, keys));
}

test.isNodeTree = function(data) {
    return test.isObject(data) &&
        test.hasKeys(data, ["children"]);
}

test.objectNestedTest = function(keyTestPairs) {
    const keys = Object.keys(keyTestPairs);
    function inner(data) {
        return test.hasExactKeys(data, keys) &&
            keys.every(function(key) {
                var subTest = keyTestPairs[key];
                var subData = data[key];
                return subTest(subData);
            });
    }
    return inner;
}

export default test;
