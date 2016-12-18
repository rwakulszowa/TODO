var router = { };

//TODO: create an array of (condition, handler), check one by one, return a pair
router.route = function(data) {
    if (isCallTree(data)) return "callTree"
    else if (isObject(data)) return "objectTree"
    else if (isNumericArray(data)) return "numArray"
    else if (isXYZArray(data)) return "xyzArray"
    else if (isObjectArray(data)) return "objectArray"
    else return null;
}

function hasKeys(o, keys) {
    var keys = keys.sort();
    var oKeys = Object.keys(o);
    return oKeys.every(k => keys.indexOf(k) != -1);
}

function isObject(o) {
    return o !== null &&
        !Array.isArray(o) &&
        typeof o === "object";
}

function isCallTree(o) {
    return hasKeys(o, ["input", "output", "children"]);
}

function isNumericArray(data) {
    return Array.isArray(data) &&
        data.every(d => Number.isFinite(d));
}

function isObjectArray(data) {
    return Array.isArray(data) &&
        data.every(isObject);
}

function isXYZArray(data) {
    if (Array.isArray(data) && data.length > 0) {
        return data.every(d => hasKeys(d, ["x", "y", "z"]));
    } else {
        return false;
    }

}

export default router;
