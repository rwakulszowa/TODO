var analyzer = { };

analyzer.hasKeys = function(o, keys) {
    var keys = keys.sort();
    var oKeys = Object.keys(o);
    return oKeys.every(k => keys.indexOf(k) != -1);
}

analyzer.isObject = function(o) {
    return o !== null &&
        !Array.isArray(o) &&
        typeof o === "object";
}

analyzer.isCallTree = function(o) {
    return analyzer.hasKeys(o, ["input", "output", "children"]);
}

analyzer.isNumericArray = function(data) {
    return Array.isArray(data) &&
        data.every(d => Number.isFinite(d));
}

analyzer.isObjectArray = function(data) {
    return Array.isArray(data) &&
        data.every(analyzer.isObject);
}

analyzer.isXYZArray = function(data) {
    if (Array.isArray(data) && data.length > 0) {
        return data.every(d => analyzer.hasKeys(d, ["x", "y", "z"]));
    } else {
        return false;
    }

}

export default analyzer;