import test from "./test"
import tree from "./tree"
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


const treeProcessor = makeTreeProcessor(
    (nodeWrapper, index) => (
        {
            value: {
                x: index,
                y: nodeWrapper.depth,
                z: nodeWrapper.node.value,
                w: nodeWrapper.node.value },
            children: [],
            network: [] }));


function makeTreeProcessor(nodeMapper) {  //TODO: consider making this a tree.Node method

    function inner(key, obj) {
        const root = tree.buildTree(obj);
        const flatTree = root.flatten();
        const children = flatTree.map(nodeMapper);
        const network = utils.flattenArray(
            flatTree.map(n => n.edges));

        return {
            value: { x: 0, y: 0 },  //FIXME: use key here
            children,
            network };}

    return inner; }


function objectTree(key, node) {

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
