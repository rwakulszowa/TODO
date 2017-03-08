import test from "./test"


var process = { };


process.digObjectTree = function(data) {

    function moveMatrix(mat) {
        mat.forEach(col => col.splice(0, 0, null));
        return mat;
    }

    function dig(obj) {
        var keys = Object.keys(obj),
            vals = keys.sort().map(k => obj[k]);

        var testFun = function(obj) {
            // Only dig objects of the same signature
            return test.isObject(obj) &&
                Object.keys(obj).length == keys.length &&
                test.hasKeys(obj, keys);
        };

        var dug = vals.map(function(v) {
            return testFun(v) ? moveMatrix(dig(v)) : [[v]];
        });

        var flattened = [].concat.apply([], dug);
        return flattened;
    }

    return dig(data);
}

process.wrapArray = function(data) {
    return [data];
}

process.hierarchize = function(data) {
    return d3.hierarchy(data);
}

process.sortByX = function(data) {
    return data.sort((a, b) => b.x < a.x ? -1 : b.x > a.x ? 1 : 0);
}

export default process;
