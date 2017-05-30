import router from "./src/router"

function show(data, size, container) {
    size = size || { x: 860, y: 640 };
    container = container || d3.select("body")
	  .append("svg")
	    .attr("width", size.x)
	    .attr("height", size.y);

    const routerCls = router.SimpleRouter;
    const tree = routerCls.buildCanvasTree(data);
    // tree.paint(container, size);//TODO
}


export {show};
export {default as stencil} from "./src/stencil";
export {default as dataGraph} from "./src/datagraph";
export {default as canvasTree} from "./src/canvastree";
export {default as router} from "./src/router";
export {default as test} from "./src/test";
export {default as utils} from "./src/utils";
