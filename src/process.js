import test from "./test"
import utils from "./utils"


var process = { };

process.chain = function(funs) {
    function inner(data) {
        for (var fun of funs) {
            data = fun(data);
        }
        return data;
    }
    return inner;
}

process.sortByX = function(data) {
    return data.sort((a, b) => b.x < a.x ? -1 : b.x > a.x ? 1 : 0);
}

process.fillXYZ = function(keys) {
    function inner(data) {
        return data.map(function(d) {
            const ans = {};
            keys.forEach(k => ans[k] = d[k] || 0);
            return ans;
        });
    }
    return inner;
}

process.wrapArray = function(data) {
    return [data];
}

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

process.graphify = function(data) {
    const nodes = data.nodes.map(x => ({ id: x }));
    const links = data.links.map(x => ({ source: x[0], target: x[1] }));
    return { nodes, links };
}

process.hierarchize = function(data) {
    const keys = Object.keys(data);
    keys.pop("children");
    // Try to guess the value key
    const key = keys.includes("value") ? "value" : keys[0];
    if (key != "value") {
        // Remap the guessed key to "value" property
        data = utils.mapTree(data, t => utils.renameProperty(t, key, "value"))
    }
    return d3.hierarchy(data);
}

export default process;
