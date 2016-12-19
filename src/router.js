import analyzer from "./analyzer"
import painter from "./painter"


var router = {};

router.simpleRouter = class {

    constructor() {
        this.patterns = [
            [analyzer.isCallTree, painter.CallTree],
            [analyzer.isObject, painter.ObjectTree],
            [analyzer.isNumericArray, painter.BarChart],
            [analyzer.isXYZArray, painter.ScatterPlot],
            [analyzer.isObjectArray, painter.ObjectArray]
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
