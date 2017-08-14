var tape = require("tape"),
    splendid = require("../");
    shape = splendid.shape;


tape("Rectangle's inner rectangle is of the same size as parent", function(test) {
    const rect = new shape.Rectangle(
        200,
        160);

    test.same(
        rect.inner(shape.Rectangle),
        rect);

    test.end(); })


tape("Rectangle computes its inner circle", function(test) {
    const rect = new shape.Rectangle(
        200,
        160);

    test.same(
        rect.inner(shape.Circle),
        new shape.Circle(80));

    test.end(); })


tape("Circle computes its inner rectangle", function(test) {
    const circle = new shape.Circle(100);
    const sideLen = 100 * Math.sqrt(2);

    test.same(
        circle.inner(shape.Rectangle),
        new shape.Rectangle(
            sideLen,
            sideLen));

    test.end(); })
