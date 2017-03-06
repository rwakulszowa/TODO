import router from "./src/router"


//TODO: turn this into a d3-like object
function draw(data, size, container, extras) {
    size = size || { x: 860, y: 640 };
    container = container || d3.select("body")
	  .append("svg")
	    .attr("width", size.x)
	    .attr("height", size.y);
    extras = extras || [];

    const routerInstance = new router.SimpleRouter();
    const tree = routerInstance.buildTree(data, extras);
    tree.paint(container, size);
}


export {draw};
export {default as analyzer} from "./src/analyzer";
export {default as extra} from "./src/extra";
export {default as painter} from "./src/painter";
export {default as processor} from "./src/processor";
export {default as router} from "./src/router";
export {default as utils} from "./src/utils";
