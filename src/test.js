var test = { };

test.hasKeys = function(o, keys) {
    var oKeys = Object.keys(o);
    return keys.every(k => oKeys.indexOf(k) != -1);
}

test.hasExactKeys = function(o, keys) {
    var oKeys = Object.keys(o);
    return oKeys.length == keys.length &&
        keys.every(k => oKeys.indexOf(k) != -1);
}

test.isObject = function(o) {
    return o !== null &&
        !Array.isArray(o) &&
        typeof o === "object";
}

test.isNumericArray = function(data) {
    return Array.isArray(data) &&
        data.every(d => Number.isFinite(d));
}

test.isExactObjArray = function(keys) {
    function foo(data) {
        return Array.isArray(data) &&
            data.every(d => test.hasExactKeys(d, keys));
    }
    return foo;
}

test.isNodeTree = function(data) {
    return test.isObject(data) &&
        test.hasKeys(data, ["value"]);
}

test.isNodesEdges = function(data) {
    return test.isObject(data) &&
        test.hasKeys(data, ["nodes", "links"]) &&
        [data.nodes, data.links].every(d => Array.isArray(d));
}

export default test;
