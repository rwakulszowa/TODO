import router from "./src/router"


//TODO: turn this into a d3-like object
function show(data, size, container, extras) {
    size = size || { x: 860, y: 640 };
    container = container || d3.select("body")
	  .append("svg")
	    .attr("width", size.x)
	    .attr("height", size.y);
    extras = extras || [];

    const routerInstance = new router.SimpleRouter();
    const tree = routerInstance.buildTree(data, extras);
    tree.draw(container, size);
}


export {show};
export {default as draw} from "./src/draw";
export {default as process} from "./src/process";
export {default as router} from "./src/router";
export {default as test} from "./src/test";
export {default as utils} from "./src/utils";
