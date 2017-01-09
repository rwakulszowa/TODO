import router from "./src/router"

function draw(sel, data, size, ctx) {
    var r = ctx.router || new router.SimpleRouter();
    r.proceed(sel, data, size, ctx);
}

export {draw};
export {default as analyzer} from "./src/analyzer";
export {default as painter} from "./src/painter";
export {default as processor} from "./src/processor";
export {default as router} from "./src/router";
