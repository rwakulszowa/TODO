var tape = require("tape"),
    splendid = require("../");
    shape = splendid.shape;


tape("Rectangle computes its center", function(test) {
    const rect = new shape.Rectangle(
        200,
        160);

    test.same(
        rect.center(),
        {
            x: 100,
            y: 80 });

    test.end(); })


tape("Rectangle is its own boundingRectangle", function(test) {
    const rect = new shape.Rectangle(
        200,
        160);

    test.same(
        rect.boundingRectangle(),
        rect);

    test.end(); })
