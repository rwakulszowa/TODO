var router = { };

router.route = function(data) {
    if (isCallTree(data)) return "callTree"
    else if (isNumericArray(data)) return "numArray"
    else return null;
}

function hasKeys(o, keys) {
    var keys = keys.sort();
    var oKeys = Object.keys(o);
    return oKeys.every(k => keys.indexOf(k) != -1);
}

function isCallTree(o) {
    return hasKeys(o, ["input", "output", "children"]);
}

function isNumericArray(data) {
    return Array.isArray(data) &&
        data.every(d => Number.isFinite(d));
}

export default router;
