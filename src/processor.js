import analyzer from "./analyzer"


var processor= { };

processor.noop = function(data, extras) {
    return { data, extras };
}

processor.digObjectTree = function(data, extras) {

    function moveMatrix(mat) {
        mat.forEach(col => col.splice(0, 0, null));
        return mat;
    }

    function dig(obj) {
        var keys = Object.keys(obj),
            vals = keys.sort().map(k => obj[k]);

        var test = function(obj) {
            // Only dig objects of the same signature TODO: don't dig at all (?)
            return analyzer.isObject(obj) &&
                Object.keys(obj).length == keys.length &&
                analyzer.hasKeys(obj, keys);
        };

        var dug = vals.map(function(v) {
            return test(v) ? moveMatrix(dig(v)) : [[v]];
        });

        var flattened = [].concat.apply([], dug);
        return flattened;
    }

    var data = dig(data);

    return { data, extras };

}

processor.wrapArray = function(data, extras) {
    var data = [data];

    return { data, extras };
}

processor.hierarchize = function(data, extras) {
    var data = d3.hierarchy(data);

    return { data, extras };
}

export default processor;
