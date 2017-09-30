import test from "./test"
import utils from "./utils"


class Pattern {
    constructor(label, test, processor) {
        this.label = label,
        this.test = test,
        this.processor = processor }

    matches(obj) {
        return this.test(obj); }

    process(key, obj) {
        return new Result(
            this.processor(
              key,
              obj),
            this); }}


class Result {
    constructor(value, pattern) {
        this.value = value,
        this.pattern = pattern }

    unwrap() {
        return this.value; }}


class SimpleCoercer {  //TODO: subclass router, rename current router to CanvasTreeBuilder?; return datagraphs from here and rename this to dataGraphBuilder?

    patterns() {
        return [

            new Pattern(
                "plainData",
                test.isPlainData,
                (key, obj) => ({
                    value: { x: obj, y: obj },
                    children: [],
                    network: [] })),

            new Pattern(
                "rawDataGraph",
                test.isRawDataGraph,
                (key, obj) => obj),

            new Pattern(
                "treeLike",
                test.isTree,
                treeProcessor),

            new Pattern(
                "objectTree",
                test.isObjectLike,
                objectTree)];}

    _coerce(key, data) {
        const match = this.match(data);
        const result = match.process(key, data);
        return result; }

    coerce(data) {
        return this._coerce(
            "root",
            data).unwrap(); }

    match(data) {
      let self = this;
      const matches = this.patterns().filter(
          pattern => pattern.matches(data));
      if (matches.length > 0) {
          return matches[0] }
      else {
          console.log(`No match for ${JSON.stringify(dataGraphNode, 0, 4)}`);
          return null; }}}

//TODO: utility class to store trees with references, convertible to an indexed tree (find some external tree / graph processing library)
function treeProcessor(key, node) {
    //NOTE: expects a tree of Node = { value: ?, children: [Node]}

    function randInt(limit) {
        return Math.floor(
            Math.random() * limit);};  //FIXME: temporary hack to make nodes visible; TODO: 1D stencil for trees with undefined x and y (generated dynamically inside the Stencil); TODO: 0D stencil for nodes defined purely by their network

    function valueToGraph(val) {  //FIXME: a more fancy way to call the coercer recursively
        return {
            value: {
                x: randInt(100),
                y: randInt(100),
                z: val,
                w: val },
            children: [],
            network: [] };};

    const flatTree = utils.flattenTree(node);

    const indexedTree = {
        nodes: [],
        edges: [] };

    flatTree.forEach(
        (node, index) => {
            indexedTree.nodes.push(node.value);
            node.children.forEach(
                child => {
                    const childIndex = flatTree.indexOf(child);
                    indexedTree.edges.push(
                        [index, childIndex]);})});

    return {
        value: { x: 0, y: 0 },
        children: indexedTree.nodes.map(valueToGraph),
        network: indexedTree.edges };}


function objectTree(key, node) {  //NOTE: dumps the keys only, ignores values

    function handlePlain(key, datum) {
        let value = Number(key) || 0;  //FIXME: allow non numeric values
        return {
            value,
            children: [] };}

    function handleComplex(key, obj) {  // Object | Array | customObject
        const children = Object.keys(obj).map(
            key => treeify(key, obj[key]));

        return {
            value: Number(key) || 0,
            children }; }

    function treeify(key, value) {
        return test.isPlainData(value)
            ? handlePlain(key, value)
            : handleComplex(key, value); }

    const tree = treeify(key, node);

    return treeProcessor(key, tree); }


export default {
    SimpleCoercer };
