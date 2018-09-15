import utils from "./utils"


//TODO: replace `children` with `neighbours`, rename to graph.js
class Node {
    constructor(value, children) {
        this.value = value;
        this.children = children || [];
    }

    flatten() {

        let flattenArray = arr =>
            arr.length == 0
            ? arr
            : arr.reduce(
                (acc, el) => acc.concat(el));

        function dig(node, depth) {

            let wrappedNode = {  //TODO: NodeWrapped / Result class
                node,
                depth,
                children: node.children };

            let children = utils.flattenArray(
                node.children.map(  // assumes a valid (acyclic) tree
                    child => dig(child, depth + 1)));

            children.unshift(wrappedNode);
            return children; }

        function indexify(wrappedNodes) {  // [{ Node, depth, [Node] }] -> [{ Node, depth, [[indexFrom, indexTo]] }]

            let nodes = wrappedNodes.map(wn => wn.node);

            function indexifySingle(nodeWrapper, index) {
                const { node, depth, children } = nodeWrapper;

                const edges = children.map(
                    node => [
                        index,
                        nodes.indexOf(node)]);

                return {
                    node,
                    depth,
                    edges }; }

            //FIXME: obviously O(n^2), use a Set
            return wrappedNodes.map(indexifySingle); }

        return indexify(
            dig(
                this,
                0)); }}


function buildTree(nodeObj) {
    return new Node(
        nodeObj.value,
        nodeObj.children.map(buildTree)); };


export default {
    buildTree,
    Node };
