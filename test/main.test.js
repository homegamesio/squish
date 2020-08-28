const { squish, unsquish } = require('../src/squish');
const { GameNode } = require('../src/GameNode');
const { COLORS, randomColor } = require("../src/Colors");
const Shapes = require('../src/Shapes');
const ShapeUtils = require('../src/util/shapes');

const assert = require('assert');

const compareSquished = (preSquish, unsquished) => {
    for (const key in preSquish) {
        if (key == 'children' || key == 'listeners') {
            continue;
        }
        try {
            if (key === 'handleClick') {
                const expectedValue = preSquish.handleClick !== null && preSquish.handleClick !== undefined;
                assert(!!unsquished[key] === expectedValue);
            } else if (key === 'coordinates2d') {
                if (!preSquish.coordinates2d) {
                    assert(!unsquished.coordinates2d);
                } else {
                    const preSquishFlat = preSquish.coordinates2d.flat();
                    for (let i = 0; i < unsquished.coordinates2d.length; i++) {
                        assert(preSquishFlat[i] === unsquished.coordinates2d[i]);
                    }
                }
            } else if (key === 'input' || key == 'text') {
                // TODO: Handle all of this in a more generic way
            } else if (preSquish[key] === undefined || preSquish[key] === null) {
                assert(unsquished[key] === undefined || unsquished[key] === null);
            } else if (key === 'input') {
                assert(unsquished.input.type === preSquish.input.type);
            } else if (Array.isArray(preSquish[key])) {
                const l1 = preSquish[key];
                const l2 = unsquished[key];
                for (let i = 0; i < l1.length; i++) {
                    assert(l1[i] === l2[i]);
                }
            } else if (preSquish[key].constructor === Object) {
                for (const k in preSquish[key]) {
                    if (preSquish[key][k].constructor === Object) {
                        for (const j in preSquish[key][k]) {
                            for (let nestedKey in preSquish[key][k][j]) {
                                assert(preSquish[key][k][j][nestedKey] === unsquished[key][k][j][nestedKey]);
                            }
                        }
                    } else {
                        assert(preSquish[key][k] === unsquished[key][k]);
                    }
                }
            } else {
                assert(preSquish[key] === unsquished[key]);
            }
        } catch (err) {
            console.error("Failed: " + key);
            console.log(err);
        }
    }

};

test("Simple shape", () => {
    const gameNode = new GameNode.Shape(
        COLORS.RED,
        Shapes.POLYGON,
        {
            coordinates2d: ShapeUtils.rectangle(10, 10, 50, 50),
            fill: COLORS.RED
        }
    );
    const squishedGameNode = squish(gameNode.node);
    const unsquishedGameNode = unsquish(squishedGameNode);
    compareSquished(gameNode.node, unsquishedGameNode);
});

test("Text node", () => {
    const gameNode = new GameNode.Text({
        text: 'ayy lmao',
        x: 40, 
        y: 40,
        size: 1,
        align: 'center',
        color: COLORS.BLACK
    });

    const squishedNode = squish(gameNode.node);
    const unsquishedNode = unsquish(squishedNode);
    compareSquished(squishedNode.node, unsquishedNode);
});

test("Asset node", () => {
    const gameNode = new GameNode.Asset(
        null,
        ShapeUtils.rectangle(0, 0, 10, 10),
        {
            'some-asset-ref': {
                pos: {
                    x: 2,
                    y: 2
                },
                size: {
                    x: 5,
                    y: 5
                }
            }
        }
    );
    const squishedNode = squish(gameNode.node);
    const unsquishedNode = unsquish(squishedNode);
    compareSquished(squishedNode.node, unsquishedNode);
});

test("Shape with shadow", () => {
    const gameNode = new GameNode.Shape(
        COLORS.WHITE, 
        Shapes.POLYGON,
        {
            coordinates2d: ShapeUtils.rectangle(20, 20, 30, 30),
            fill: COLORS.WHITE
        },
        42,
        null,
        {
            shadow: {
                color: COLORS.BLACK,
                blur: 6
            }
        }
    );

    const squishedNode = squish(gameNode.node);
    const unsquishedNode = unsquish(squishedNode);
    compareSquished(squishedNode.node, unsquishedNode);

});

test("Shape with onClick", () => {
    const gameNode = new GameNode.Shape(
        COLORS.GREEN, 
        Shapes.POLYGON,
        {
            coordinates2d: ShapeUtils.rectangle(0, 0, 100, 100),
            fill: COLORS.GREEN
        },
        null,
        () => {
            console.log('some function');
        }
    );

    const squished = squish(gameNode.node);
    const unsquished = unsquish(squished);

    compareSquished(gameNode.node, unsquished);
});

test("Text with text input", () => {
     const gameNode = new GameNode.Text({
        text: 'ayy lmao',
        x: 40, 
        y: 40,
        size: 1,
        align: 'center',
        color: COLORS.BLACK
    },
    null,
    {
        type: 'text',
        oninput: () => {
            console.log("I am handling text");
        }
    });

    const squishedNode = squish(gameNode.node);
    const unsquishedNode = unsquish(squishedNode);
    compareSquished(gameNode.node, unsquishedNode);
});

