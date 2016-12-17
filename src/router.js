var router = { };

//TODO: handle array of objects
//TODO: create an array of (condition, handler), check one by one, return a pair
router.route = function(data) {
    if (isCallTree(data)) return "callTree"
    else if (isObject(data)) return "objectTree"
    else if (isNumericArray(data)) return "numArray"
    else if (isAnyArray(data)) return "anyArray"
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

//TODO: add some requirements for object structure
function isAnyArray(data) {
    return Array.isArray(data);
}

export default router;
