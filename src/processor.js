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
        var vals = Object.keys(obj).sort().map(k => obj[k]);

        var dug = vals.map(function(v) {
            return analyzer.isObject(v) ? moveMatrix(dig(v)) : [[v]];
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

export default processor;
