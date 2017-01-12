import router from "./src/router"

function draw(sel, size, data, extras) {
    var maybeRouter = extras.find(
        e => e.matches("", "router"));  //TODO: this is weird, refactor somehow

    var r = maybeRouter ? maybeRouter.value : new router.SimpleRouter();
    var p = r.proceed(data, extras);

    p.paint(sel, size);
    return p;
}

export {draw};
export {default as analyzer} from "./src/analyzer";
export {default as extra} from "./src/extra";
export {default as painter} from "./src/painter";
export {default as processor} from "./src/processor";
export {default as router} from "./src/router";
