//TODO: some kinda macro / template to automate exports
//TODO: convert to a class with utils for combining multiple tests
const alwaysTrue = () => true;

const dataGraphChildValues = t => dgNode => {
    return dgNode.child &&
        dgNode.child.nodes.map(n => n.value).every(t); };

const isInstance = cls => obj => obj && obj.constructor == cls;

const isBoolean = isInstance(Boolean);

const isNumber = isInstance(Number);

const isString = isInstance(String);

const isArray = isInstance(Array);

const isNull = x => x ===null;

const isUndefined = x => x === undefined;

const isArrayOf = t => arr => {
    return isArray(arr) && arr.every(t); };

const isObject = isInstance(Object);

const isObjectLike = obj => typeof obj === "object";

const isPlainData = obj => {
    const tests = [
        isBoolean,
        isNumber,
        isString,
        isNull,
        isUndefined];
    return tests.some(t => t(obj));}

const hasNKeys = n => o => {
    return isObject(o) &&
        Object.keys(o).length == n; }

const hasKeys = keys => o => {
    const objKeys = new Set(
        Object.keys(o));
    return isObject(o) &&
        keys.every(k => objKeys.has(k)); }

const isDataGraphLeaf = dgNode => !dgNode.child;

const isRawDataGraph = obj => {
    const keys = [
        "value",
        "children",
        "network"];
    return hasNKeys(keys.length)(obj) &&
        hasKeys(keys)(obj); }

const isTree = node => {
    //FIXME: there are many more ways to represent a tree
    const treeKeys = [
        "value",
        "children"];
    return isObject(node) &&
      hasKeys(treeKeys)(node) &&
      isArray(node.children) &&
      node.children.every(isTree); }

export default {
    alwaysTrue,
    dataGraphChildValues,
    isInstance,
    isBoolean,
    isNumber,
    isString,
    isNull,
    isUndefined,
    isArray,
    isArrayOf,
    isObject,
    isObjectLike,
    isPlainData,
    hasKeys,
    hasNKeys,
    isDataGraphLeaf,
    isRawDataGraph,
    isTree };
