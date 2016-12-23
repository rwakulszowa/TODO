import analyzer from "./analyzer"
import painter from "./painter"


var router = {};

router.SimpleRouter = class {

    constructor() {
        this.patterns = [
            { test: analyzer.isCallTree, painting: painter.CallTree },
            { test: analyzer.isObject, painting: painter.ObjectTree },
            { test: analyzer.isNumericArray, painting: painter.BarChart },
            { test: analyzer.isXYZArray, painting: painter.ScatterPlot },
            { test: analyzer.isObjectArray, painting: painter.ObjectArray }
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

};

export default router;
