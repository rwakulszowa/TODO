import test from "./test"
import utils from "./utils"


class SimpleCoercer {  //TODO: subclass router, rename current router to CanvasTreeBuilder?; return datagraphs from here and rename this to dataGraphBuilder?

    patterns() {
        return [
            {
                test: test.isPlainData,
                processor: obj => {
                    return {
                      value: { x: obj, y: obj },  //FIXME: convert to 1D after implementing a 1D stencil
                      children: [],
                      network: [] };}},
            {
                test: test.isArray,  //FIXME: should check and coerce elements to a common "type"
                processor: arr => {
                    return {
                      value: { x: 0, y: 0 },
                      children: arr.map(
                          this.coerce,
                          this),
                      network: [] };}},
            {
                test: test.isRawDataGraph,
                processor: x => x },
            {
                test: test.isTree,
                processor: node => {

                    function randInt(limit) {
                        return Math.floor(
                            Math.random() * limit);};  //FIXME: temporary hack to make nodes visible; TODO: 1D stencil for trees with undefined x and y (generated dynamically inside the Stencil)

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
                        network: indexedTree.edges };}},
            {
                test: test.isObject,
                processor: obj => {
                    const keywords = [
                        "value",
                        "children",
                        "network"];
                    const [taken, remainder] = utils.splitByKeys(
                        keywords,
                        obj);
                    return {
                        value: taken.value || remainder,  //FIXME: much more specific handling needed
                        children: taken.children || [],
                        network: taken.network || [] };}}]}

    coerce(data) {
        const match = this.match(data);
        return match.processor(data);}

    match(data) {
      let self = this;
      const matches = this.patterns().filter(
          pattern => pattern.test(data));
      if (matches.length > 0) {
          return matches[0] }
      else {
          console.log(`No match for ${JSON.stringify(dataGraphNode, 0, 4)}`);
          return null; }}}


export default {
    SimpleCoercer };
