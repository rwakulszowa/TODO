import analyzer from "./analyzer"
import painter from "./painter"
import processor from "./processor"


var router = {};

router.SimpleRouter = class {

    constructor() {
        this.patterns = [
            { test: analyzer.isCallTree, processor: processor.digCallTree, painting: painter.PlotMesh },
            { test: analyzer.isObject, processor: processor.digObjectTree, painting: painter.PlotMesh },
            { test: analyzer.isNumericArray, painting: painter.BarChart },
            { test: analyzer.isXYZArray, painting: painter.ScatterPlot },
            { test: analyzer.isObjectArray, processor: processor.wrapArray, painting: painter.PlotMesh }
        ]
    }

    route(data) {
        for (var pat of this.patterns) {
            if (pat.test(data)) {
                return pat;
            }
        }
        return { test: () => true, painting: painter.Noop };
    }

    proceed(data, sel, shape, extras) {
        var match = this.route(data);
        match.processor = match.processor ? match.processor : processor.noop;
        var processed = match.processor(data, extras);
        var painting = new match.painting(processed.data, processed.extras);
        painting.paint(sel, shape);
    }

};

export default router;
