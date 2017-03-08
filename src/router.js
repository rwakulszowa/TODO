import draw from "./draw"
import process from "./process"
import test from "./test"
import tree from "./tree"


var router = {};

router.SimpleRouter = class {

    constructor() {
        this.patterns = [  //TODO: rename labels to more informative, less duplicated names
            {
                label: "Graph",
                test: test.isNodesEdges,
                draw: draw.force()
            },
            {
                label: "Tree",
                test: test.isNodeTree,
                process: process.hierarchize,
                draw: draw.tree()
            },
            {
                label: "ObjectTree",
                test: test.isObject,
                process: process.digObjectTree,
                draw: draw.nested()
            },
            {
                label: "NumericArray",
                test: test.isNumericArray,
                draw: draw.bar()
            },
            {
                label: "XYZArray",
                test: test.isExactObjArray(["x", "y", "z"]),
                draw: draw.scatter()
            },
            {
                label: "XYZWArray",
                test: test.isExactObjArray(["x", "y", "z", "w"]),
                process: process.sortByX,
                draw: draw.line()
            },
            {
                label: "AnyArray",
                test: Array.isArray,
                process: process.wrapArray,
                draw: draw.nested()
            }
        ]
    }

    isForced(obj) {
        return obj && Object.keys(obj).indexOf("SplendidLabel") != -1;
    }

    matchByLabel(data) {
        return this.patterns.find(x => x.label == data.SplendidLabel);
    }

    unwrapForcedData(data) {
        return data.data;
    }

    extend(patterns) {
        this.patterns = patterns.concat(this.patterns);
        return this;
    }

    match(data) {
        for (var pattern of this.patterns) {
            if (pattern.test(data)) {
                return pattern;
            }
        }
        return {
            label: "Ignored",
            test: () => true,
            draw: draw.empty()
        };
    }

    route(data) {
        var match;

        if (this.isForced(data)) {
            match = this.matchByLabel(data);
            data = this.unwrapForcedData(data);
        } else {
            match = this.match(data);
        }

        const draw = match.draw;
        data = match.process ? match.process(data) : data;

        return {
            draw,
            data,
            match
        }
    }

    buildTree(data) {
        var t;
        const routed = this.route(data);

        if (routed.draw.isLeaf()) {
            t = new tree.leaf(
                routed.draw,
                routed.data,
                routed.match);
        } else {
            const children = routed.data.map(
                arr => arr.map(
                    d => this.buildTree(d)));
            t = new tree.node(
                routed.draw,
                children,
                routed.match);
        }

        return t;
    }
};

export default router;
