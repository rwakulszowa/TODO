class Figure {

    constructor(shape, selection) {
        this.shape = shape;
        this.selection = selection; }

    dumps() {  //TODO: move to utils
        return JSON.stringify(
            this,
            null,
            2); }};

export default {
    Figure };
