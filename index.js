import dataGraph from "./src/datagraph"
import figure from "./src/figure"
import router from "./src/router"
import shape from "./src/shape"


function show(data, rootFigure) {
    if (!rootFigure) {
        const rootShape = new shape.Rectangle(
            860,
            640);
        const container = d3.select("body")
            .append("svg")
      	        .attr("width", rootShape.x)
      	        .attr("height", rootShape.y)
            .append("g")
                .attr("transform", `translate(${rootShape.x / 2}, ${rootShape.y / 2})`);
        rootFigure = new figure.Figure(
            rootShape,
            container); }

    const graph = dataGraph.makeNode(data);
    const routerCls = router.SimpleRouter;
    const canvasTree = routerCls.buildCanvasTree(graph);
    const paintingTree = canvasTree.paint(rootFigure);
    return paintingTree; }


export {show};
export {default as stencil} from "./src/stencil";
export {default as dataGraph} from "./src/datagraph";
export {default as canvasTree} from "./src/canvastree";
export {default as paintingTree} from "./src/paintingtree";
export {default as router} from "./src/router";
export {default as test} from "./src/test";
export {default as shape} from "./src/shape";
export {default as figure} from "./src/figure";
export {default as utils} from "./src/utils";
