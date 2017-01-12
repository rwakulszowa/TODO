import router from "./src/router"

function draw(sel, size, data, ctx) {
    var r = ctx.router || new router.SimpleRouter();
    var p = r.proceed(data, ctx);

    p.paint(sel, size);
    return p;
}

export {draw};
export {default as analyzer} from "./src/analyzer";
export {default as painter} from "./src/painter";
export {default as processor} from "./src/processor";
export {default as router} from "./src/router";
