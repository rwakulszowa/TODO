var utils = {};

utils.groupByKeys = function(seq, keys) {
    var ans = new Map();
    for (var obj of seq) {
        const complexKey = {};
        for (var key of keys) {
            complexKey[key] = obj[key];
        }
        const strKey = JSON.stringify(complexKey);
        if (ans.has(strKey)) {
            ans.get(strKey).data.push(obj);
        } else {
            const entry = complexKey;
            entry.data = [obj];
            ans.set(strKey, entry);
        }
    }
    return [...ans.keys()].map(key => ans.get(key));
}

utils.renameProperty = function(obj, oldName, newName) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
    return obj;
}

utils.mapTree = function(tree, fun) {
    fun(tree);
    if (tree.children) {
        tree.children.forEach(
            t => utils.mapTree(t, fun));
    }
    return tree;
}

utils.splitByKeys = function(keys, obj) {
    const [left, right] = [{}, {}];

    Object.keys(obj).forEach(
        key => {
            const value = obj[key];
            keys.includes(key) ?
                left[key] = value :
                right[key] = value });
    return [
        left,
        right];
}

utils.flattenTree = function(node) {

    function flatmap(f, arr) {
        const nested = arr.map(f);
        return nested.reduce(
            (acc, el) => acc.concat(el),
            []);}

    function inner(acc, node) {  //NOTE: returns references, not unwrapped values
        var children = flatmap(
            n => inner(acc, n),
            node.children);
        children.push(node);
        return children; }

    return inner([], node);}

export default utils;
