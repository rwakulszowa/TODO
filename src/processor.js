import analyzer from "./analyzer"


var processor= { };

processor.noop = function(data, extras) {
    return { data, extras };
}

processor.digCallTree = function(data, extras) {

    function dig(node) {
        var dug = Array.isArray(node.children) ? node.children.map(dig) : [];
        var flattened = [].concat.apply([], dug);
        flattened.forEach(d => d.splice(0, 0, null));
        return Array.concat([[node.input]], flattened, [[node.output]]);
    }

    function valSpan(data) {
        var min = 0,
            max = 0;

        for (var row of data) {
            for(var d of row.filter(analyzer.isNumericArray)) {
                var dMin = Math.min(d),
                    dMax = Math.max(d);
                min = dMin < min ? dMin : min;
                max = dMax > max ? dMax : max;
            }
        }

        return [min, max];
    }

    var data = dig(data),
        extras = { valSpan: valSpan(data) };

    return { data, extras };
}

processor.digObjectTree = function(data, extras) {

    function isObject(o) {
        return o !== null &&
            !Array.isArray(o) &&
            typeof o === "object";
    }

    function moveMatrix(mat) {
        mat.forEach(col => col.splice(0, 0, null));
        return mat;
    }

    function dig(obj) {
        var vals = Object.keys(obj).sort().map(k => obj[k]);

        var dug = vals.map(function(v) {
            return isObject(v) ? moveMatrix(dig(v)) : [[v]];
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
