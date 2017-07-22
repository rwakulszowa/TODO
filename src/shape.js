class Shape {

    dumps() {  //TODO: move to utils
        return JSON.stringify(
            this,
            null,
            2); }};


class Rectangle extends Shape {

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y; }

    boundingRectangle() {
        return this; }

    center() {
        return {  //TODO: position class?
            x: this.x / 2,
            y: this.y / 2 }; }}


export default {
    Rectangle };
