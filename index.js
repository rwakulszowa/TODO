import dataGraph from "./src/datagraph"
import router from "./src/router"
import shape from "./src/shape"


function show(data, rootShape, rootContainer) {
    rootShape = rootShape || new shape.Rectangle(860, 640);
    rootContainer = rootContainer || d3.select("body");

    const boundingRectangle = rootShape.boundingRectangle();
    const container = rootContainer
        .append("svg")
  	        .attr("width", boundingRectangle.x)
  	        .attr("height", boundingRectangle.y);

    const graph = dataGraph.makeNode(data);
    const routerCls = router.SimpleRouter;
    const canvasTree = routerCls.buildCanvasTree(graph);
    const paintingTree = canvasTree.paint(container, rootShape);
    return paintingTree; }


export {show};
export {default as stencil} from "./src/stencil";
export {default as dataGraph} from "./src/datagraph";
export {default as canvasTree} from "./src/canvastree";
export {default as paintingTree} from "./src/paintingtree";
export {default as router} from "./src/router";
export {default as test} from "./src/test";
export {default as shape} from "./src/shape";
export {default as utils} from "./src/utils";
