import analyzer from "./analyzer"
import painter from "./painter"


var router = {};

router.simpleRouter = class {

    constructor() {
        this.patterns = [
            [analyzer.isCallTree, painter.callTree],
            [analyzer.isObject, painter.objectTree],
            [analyzer.isNumericArray, sel => (new painter.barChart(sel).paint())],
            [analyzer.isXYZArray, painter.scatterPlot],
            [analyzer.isObjectArray, painter.objectArray]
        ]
    }

    route(data) {
        for (var pair of this.patterns) {
            var test = pair[0],
                dest = pair[1];
            if (test(data)) {
                return dest;
            }
        }
        return d => { console.log("Unsupported data type: " + data); };
    }

};

export default router;
