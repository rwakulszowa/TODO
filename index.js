import router from "./src/router"
import dataGraph from "./src/datagraph"

function show(data, size, rootContainer) {
    size = size || { x: 860, y: 640 };
    rootContainer = rootContainer || d3.select("body");

    const container = rootContainer
        .append("svg")
  	        .attr("width", size.x)
  	        .attr("height", size.y);

    const graph = dataGraph.makeGraph(data).nodes[0];  //TODO: use makeNode instead
    const routerCls = router.SimpleRouter;
    const canvasTree = routerCls.buildCanvasTree(graph);
    const paintingTree = canvasTree.paint(container, size);
    return paintingTree; }


export {show};
export {default as stencil} from "./src/stencil";
export {default as dataGraph} from "./src/datagraph";
export {default as canvasTree} from "./src/canvastree";
export {default as paintingTree} from "./src/paintingtree";
export {default as router} from "./src/router";
export {default as test} from "./src/test";
export {default as utils} from "./src/utils";
