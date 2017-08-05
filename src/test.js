const alwaysTrue = () => true;

const dataGraphChildValues = t => dgNode => {
    return dgNode.child &&
        dgNode.child.nodes.map(n => n.value).every(t); };

const isObject = o => {
    return o !== null &&
        !Array.isArray(o) &&
        typeof o === "object"; }

const hasNKeys = n => o => {
    return isObject(o) &&
        Object.keys(o).length == n; }

const isDataGraphLeaf = dgNode => !dgNode.child;

export default {
    alwaysTrue,
    dataGraphChildValues,
    isObject,
    hasNKeys,
    isDataGraphLeaf };
