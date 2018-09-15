class Shape {

    inner(target) {
        return handleByClass(
            this._inner_handlers(),
            target)}

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

    scale(factor) {
        return new Rectangle(
            factor * this.x,
            factor * this.y);}

    _inner_handlers() {
        const self = this;
        return [
            [
                Rectangle,
                () => new Rectangle(
                    self.x,
                    self.y)],
            [
                Circle,
                () => new Circle(
                    Math.min(
                        this.x,
                        this.y)
                    / 2)]];}}


class Circle extends Shape {

    constructor(r) {
        super();
        this.r = r; }

    scale(factor) {
        return new Circle(factor * this.r);}

    _inner_handlers() {
        const self = this;
        return [
            [
                Circle,
                () => new Circle(self.r)],
            [
                Rectangle,
                () => new Rectangle(
                    self.r * Math.sqrt(2),
                    self.r * Math.sqrt(2))]];}}


function handleByClass(pairs, target) {
    function test(pair) {
        const [cls, callback] = pair;
        return cls == target; }
    const [cls, callback] = pairs.find(test);
    return callback();}


export default {
    Circle,
    Rectangle };
