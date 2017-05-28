class DataGraphNode {

    constructor(value, child) {
        this.value = value;
        this.child = child; }}


class DataGraph {

    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges; }}


function makeGraph(data) {  // data: Array<Node>, Node: Pair<Int, Array<Node>>
    return new DataGraph(
        data.map(_makeNode),
        []); }  //FIXME: allow edges

function _makeNode(data) {
    var childGraph =
        data.children ?
            makeGraph(data.children) :
            null;

    return new DataGraphNode(
        data.value,
        childGraph); }


export default {
    makeGraph,
    DataGraph,
    DataGraphNode };
