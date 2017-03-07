var dimension = {};


dimension.Dimension = class Dimension {
    constructor(data, key) {
        this.data = data;
        this.key = key;
    }
}


dimension.ContinuousDimension = class ContinuousDimension extends Dimension {
    constructor(data, key) {
        super(data, key);
    }


}


dimension.OrdinalDimension = class OrdinalDimension extends Dimension {
    constructor(data, key) {
        super(data, key);
    }
}

