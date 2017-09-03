//TODO: some kinda macro / template to automate exports
//TODO: convert to a class with utils for combining multiple tests
const alwaysTrue = () => true;

const dataGraphChildValues = t => dgNode => {
    return dgNode.child &&
        dgNode.child.nodes.map(n => n.value).every(t); };

const isInstance = cls => obj => obj.constructor == cls;

const isBoolean = isInstance(Boolean);

const isNumber = isInstance(Number);

const isString = isInstance(String);

const isArray = isInstance(Array);

const isArrayOf = t => arr => {
    return isArray(arr) && arr.every(t); };

const isObject = isInstance(Object);

const isPlainData = obj => {
    const tests = [
        isBoolean,
        isNumber,
        isString];
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

export default {
    alwaysTrue,
    dataGraphChildValues,
    isInstance,
    isBoolean,
    isNumber,
    isString,
    isArray,
    isArrayOf,
    isObject,
    isPlainData,
    hasKeys,
    hasNKeys,
    isDataGraphLeaf,
    isRawDataGraph };
