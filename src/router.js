import analyzer from "./analyzer"
import painter from "./painter"
import processor from "./processor"


var router = {};

router.SimpleRouter = class {

    constructor() {
        this.patterns = [
            {
                label: "Graph",
                test: analyzer.isNodesEdges,
                painting: painter.forceGraph()
            },
            {
                label: "NodeTree",
                test: analyzer.isNodeTree,
                processor: processor.hierarchize,
                painting: painter.treePlot()
            },
            {
                label: "ObjectTree",
                test: analyzer.isObject,
                processor: processor.digObjectTree,
                painting: painter.plotMesh()
            },
            {
                label: "NumericArray",
                test: analyzer.isNumericArray,
                painting: painter.barChart()
            },
            {
                label: "XYZArray",
                test: analyzer.isXYZArray,
                painting: painter.scatterPlot()
            },
            {
                label: "XYZWArray",
                test: analyzer.isXYZWArray,
                processor: processor.sortByX,
                painting: painter.lineGraph()
            },
            {
                label: "AnyArray",
                test: Array.isArray,
                processor: processor.wrapArray,
                painting: painter.plotMesh()
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
            painting: painter.noop()
        };
    }

    route(data, extras) {
        var match;

        if (this.isForced(data)) {
            match = this.matchByLabel(data);
            data = this.unwrapForcedData(data);
        } else {
            match = this.match(data);
        }

        extras = extras || [];
        const painting = match.painting;
        const process = match.processor || processor.noop;
        const processed = process(data, extras);

        data = processed.data;
        extras = processed.extras;

        return {
            painting,
            data,
            extras,
            match
        }
    }

    buildTree(data, extras) {
        //TODO: remake the current extras mechanism, get relevant values based on the tree
        var tree;
        const routed = this.route(data, extras);

        if (routed.painting.isLeaf()) {
            tree = new Leaf(
                routed.painting,
                routed.data,
                routed.extras,
                routed.match);
        } else {
            const children = routed.data.map(
                arr => arr.map(
                    d => this.buildTree(d, extras)));
            tree = new Node(
                routed.painting,
                children,
                routed.extras,
                routed.match);
        }

        return tree;
    }
};

class Tree {
    constructor(painting, extras, match) {
        this.painting = painting;
        this.extras = extras;
        this.match = match;
    };

    dumps() {
        return JSON.stringify(
            this.dump(),
            null,
            2);
    }
};

class Leaf extends Tree {
    constructor(painting, data, extras, match) {
        super(painting, extras, match);
        this.data = data;
    }

    dump() {
        return {
            "label": this.match.label
        };
    }

    paint(sel, shape) {
        const painting = new this.painting(
            this.data,
            this.extras,
            this.match.label
        );
        painting.paint(
            sel,
            shape
        );
    }
}

class Node extends Tree {
    constructor(painting, children, extras, match) {
        super(painting, extras, match);
        this.children = children;
    }

    dump() {
        return {
            "label": this.match.label,
            "children": this.childrenFlat().map(x => x.dump()),
        };
    }

    childrenFlat() {
        return this.children.reduce(
            function(acc, val) {
                acc.push(...val);
                return acc;
            },
            []);
    }

    paint(sel, shape) {
        const painting = new this.painting(
            this.children,
            this.extras,
            this.match.label
        );
        painting.paint(
            sel, shape
        );
    }
}

export default router;
