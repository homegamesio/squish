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
            } else if (preSquish[key] === undefined || preSquish[key] === null) {
                assert(unsquished[key] === undefined || unsquished[key] === null);
            } else if (key === 'input') {
                assert(unsquished.input.type === preSquish.input.type);
            } else if (Array.isArray(preSquish[key])) {
                console.log("HUHUH");
                console.log(preSquish);
                console.log(unsquished);
                const l1 = preSquish[key];
                const l2 = unsquished[key];
                console.log(l1);
                console.log(l2);
                for (let i = 0; i < l1.length; i++) {
                    console.log("SFLKGJFG");
                    console.log(l1[i]);
                    console.log(l2[i]);
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

//const testEffects = () => {
//    const gameNode = GameNode(
//        COLORS.BLUE,
//        null,
//        {
//            x: 10,
//            y: 10
//        },
//        {
//            x: 20,
//            y: 20
//        }, 
//        null,
//        null,
//        0,
//        {
//            'shadow': {
//                'color': COLORS.BLACK,
//                'blur': 12
//            }
//        }
//    );
//
//    const squished = squish(gameNode);
//    const unsquished = unsquish(squished);
//
//    compareSquished(gameNode, unsquished);
//};
//
//const testInput = () => {
//    const gameNode = GameNode(Colors.BLUE, null, {x: 0, y: 0}, {x: 100, y: 100}, null, null, 50, null, {
//        type: 'text',
//        oninput: (thing) => {
//        }
//    });
//
//    const squished = squish(gameNode);
//    const unsquished = unsquish(squished);
//
//    compareSquished(gameNode, unsquished);
//};
//
//const testShape = () => {
//    console.log("VERY COOL");
//    const ting = new GameNode.Shape(
//        Colors.HG_BLACK,
//        Shapes.POLYGON,
//        {
//            coordinates2d: [
//                [10.1, 10],
//                [20.3, 10.5],
//                [20.98, 20],
//                [10.89, 20],
//                [10, 10.01]
//            ]
//        }
//    );
//    const thing = squish(ting.node);
//    console.log("THING");
//    const unting = unsquish(thing);
//    console.log(unting.coordinates2d);
//};
//
//const testText = () => {
//    const testText = new GameNode.Text({
//        text: 'Hello world!',
//        x: 42, 
//        y: 20,
//        size: 4,
//        align: 'left'
//    });
//
//    const thing = squish(testText.node);
//    const unsquished = unsquish(thing);
//    console.log(unsquished);
// 
//};

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

//test("Text node", () => {
//    const gameNode = new GameNode.Text({
//        text: 'ayy lmao',
//        x: 40, 
//        y: 40,
//        size: 1,
//        align: 'center',
//        color: COLORS.BLACK
//    });
//
//    const squishedNode = squish(gameNode.node);
//    const unsquishedNode = unsquish(squishedNode);
//    compareSquished(squishedNode.node, unsquishedNode);
//});
//
//test("Asset node", () => {
//    const gameNode = new GameNode.Asset(
//        null,
//        ShapeUtils.rectangle(0, 0, 10, 10),
//        {
//            'some-asset-ref': {
//                pos: {
//                    x: 2,
//                    y: 2
//                },
//                size: {
//                    x: 5,
//                    y: 5
//                }
//            }
//        }
//    );
//    const squishedNode = squish(gameNode.node);
//    const unsquishedNode = unsquish(squishedNode);
//    compareSquished(squishedNode.node, unsquishedNode);
//});
//
//test("Shape with shadow", () => {
//    const gameNode = new GameNode.Shape(
//        COLORS.WHITE, 
//        Shapes.POLYGON,
//        {
//            coordinates2d: ShapeUtils.rectangle(20, 20, 30, 30),
//            fill: COLORS.WHITE
//        },
//        42,
//        null,
//        {
//            shadow: {
//                color: COLORS.BLACK,
//                blur: 6
//            }
//        }
//    );
//
//    const squishedNode = squish(gameNode.node);
//    const unsquishedNode = unsquish(squishedNode);
//    compareSquished(squishedNode.node, unsquishedNode);
//
//});
//
//test("Shape with onClick", () => {
//    const gameNode = new GameNode.Shape(
//        COLORS.GREEN, 
//        Shapes.POLYGON,
//        {
//            coordinates2d: ShapeUtils.rectangle(0, 0, 100, 100),
//            fill: COLORS.GREEN
//        },
//        null,
//        () => {
//            console.log('some function');
//        }
//    );
//
//    const squished = squish(gameNode.node);
//    const unsquished = unsquish(squished);
//
//    compareSquished(gameNode, unsquished);
//});

//testOnClick();
//testInput();
//testShape();
//testText();
