var tree = {};


class Tree {
    constructor(drawing, match) {
        this.drawing = drawing;
        this.match = match;
    };

    dumps() {
        return JSON.stringify(
            this.dump(),
            null,
            2);
    }
};


tree.leaf = class Leaf extends Tree {
    constructor(drawing, data, match) {
        super(drawing, match);
        this.data = data;
    }

    dump() {
        return {
            "label": this.match.label
        };
    }

    draw(sel, shape) {
        const drawing = new this.drawing(
            this.data,
            this.match.label
        );
        drawing.draw(
            sel,
            shape
        );
    }
}


tree.node = class Node extends Tree {
    constructor(drawing, children, match) {
        super(drawing, match);
        this.children = children;
    }

    dump() {
        return {
            "label": this.match.label,
            "children": this.childrenFlat().map(x => x.dump()),
        };
    }

    childrenFlat() {
        return this.children.reduce(
            function(acc, val) {
                acc.push(...val);
                return acc;
            },
            []);
    }

    draw(sel, shape) {
        const drawing = new this.drawing(
            this.children,
            this.match.label
        );
        drawing.draw(
            sel, shape
        );
    }
}


export default tree;
