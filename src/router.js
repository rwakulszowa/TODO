import analyzer from "./analyzer"
import painter from "./painter"
import processor from "./processor"


var router = {};

router.SimpleRouter = class {

    constructor() {
        this.patterns = [
            { label: "NodeTree", test: analyzer.isNodeTree, processor: processor.hierarchize, painting: painter.TreePlot },
            { label: "ObjectTree", test: analyzer.isObject, processor: processor.digObjectTree, painting: painter.PlotMesh },
            { label: "NumericArray", test: analyzer.isNumericArray, painting: painter.BarChart },
            { label: "XYZArray", test: analyzer.isXYZArray, painting: painter.ScatterPlot },
            { label: "ObjectArray", test: analyzer.isObjectArray, processor: processor.wrapArray, painting: painter.PlotMesh }
        ]
    }

    route(data) {
        for (var pat of this.patterns) {
            if (pat.test(data)) {
                return pat;
            }
        }
        return { label: "Ignored", test: () => true, painting: painter.Noop };
    }

    proceed(data, extras) {
        var match = this.route(data);
        match.processor = match.processor ? match.processor : processor.noop;
        var processed = match.processor(data, extras);
        var painting = new match.painting(processed.data, processed.extras, match.label);
        return painting.prepare();
    }

    extend(patterns) {
        this.patterns = patterns.concat(this.patterns);
        return this;
    }

};

export default router;
