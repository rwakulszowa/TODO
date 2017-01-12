class Extra {

    constructor(value, bindings, updateFun) {
        this.value = value;
        this.bindings = bindings;
        this.updateFun = updateFun || defaultUpdateFun;
    }

    update(newValue) {
        this.value = this.updateFun(this.value, newValue);
        return this;
    }

    matches(label, param) {
        for (var key of this.bindings) {
            var pair = key.split(".");
            if ( (label === pair[0] || "*" === pair[0]) && param === pair[1])
                return true;
        }
        return false;
    }
}

function defaultUpdateFun(oldVal, newVal) {
    return newVal;
}

export default Extra;
