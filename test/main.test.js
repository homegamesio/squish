const { squish, unsquish } = require('../src/squish');
const { GameNode } = require('../src/GameNode');
const { COLORS } = require("../src/Colors");
const Shapes = require('../src/Shapes');
const ShapeUtils = require('../src/util/shapes');
const { verifyArrayEquality, rectNode, FakeGame } = require('./utils');
const Squisher = require('../src/Squisher');
const Game = require('../src/Game');

const assert = require('assert');
const process = require('process');

const hypLength = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

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
                    verifyArrayEquality(preSquish.coordinates2d, unsquished.coordinates2d);
                }
            } else if (key === 'input' || key == 'text' || key == 'free') {
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
            } else if (key === 'id') {
                assert(Number(preSquish[key]) === Number(unsquished[key]));
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
    const gameNode = new GameNode.Shape({
        fill: COLORS.RED,
        coordinates2d: ShapeUtils.rectangle(10, 10, 50, 50),
        shapeType: Shapes.POLYGON
    });
    const squishedGameNode = squish(gameNode);
    const unsquishedGameNode = unsquish(squishedGameNode).node;
    compareSquished(gameNode.node, unsquishedGameNode);
});

test("Simple shape visible to 2 players", () => {
    const gameNode = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(10, 10, 50, 50),
        fill: COLORS.RED,
        playerIds: [1, 2]
    });

    const squishedGameNode = squish(gameNode);
    const unsquishedGameNode = unsquish(squishedGameNode).node;
    compareSquished(gameNode.node, unsquishedGameNode);
    assert(unsquishedGameNode.playerIds.length == 2);
    assert(unsquishedGameNode.playerIds[0] == 1);
    assert(unsquishedGameNode.playerIds[1] == 2);
});

test("Simple text visible to 255 players", () => {
    const playerIds = Array.from({length: 255}, (_, i) => i + 1);
    const gameNode = new GameNode.Text({
        textInfo: {
            text: 'Hello, world!',
            x: 4,
            y: 20,
            size: 5,
            align: 'center',
            color: COLORS.RED
        },
        playerIds
    });

    const squishedGameNode = squish(gameNode);
    const unsquishedGameNode = unsquish(squishedGameNode).node;
    compareSquished(gameNode.node, unsquishedGameNode);
    assert(unsquishedGameNode.playerIds.length == 255);
    for (let i = 0; i < playerIds.length; i++) {
        assert(unsquishedGameNode.playerIds[i] == playerIds[i]);
    }
});

test("Text node with unicode", () => {
    const gameNode = new GameNode.Text({
        textInfo: {
            text: '💯😂💯',
            x: 40,
            y: 40,
            size: 1,
            align: '😂😂😂😂😂',//center',
            color: COLORS.BLACK
        }
    });
    const squishedNode = new Uint8ClampedArray(squish(gameNode));
    const unsquishedNode = unsquish(squishedNode);
    compareSquished(squishedNode.node, unsquishedNode);
    assert(unsquishedNode.node.text.text.length === 6);
    assert([...unsquishedNode.node.text.text].length === 3);
    assert(unsquishedNode.node.text.text.codePointAt(0) === '💯'.codePointAt(0));
    assert(unsquishedNode.node.text.text.codePointAt(4) === '💯'.codePointAt(0));
});


test("Text node", () => {
    const gameNode = new GameNode.Text({
        textInfo: {
            text: 'ayy lmao',
            x: 40,
            y: 40,
            size: 1,
            align: 'center',
            color: COLORS.BLACK
        }
    });

    const squishedNode = squish(gameNode);
    const unsquishedNode = unsquish(squishedNode).node;
    compareSquished(squishedNode.node, unsquishedNode);
});

test("Text node with custom font", () => {
    const gameNode = new GameNode.Text({
        textInfo: {
            text: 'ayy lmao',
            font: 'test-font',
            x: 40,
            y: 40,
            size: 1,
            align: 'center',
            color: COLORS.BLACK
        }
    });

    const squishedNode = squish(gameNode);
    const unsquishedNode = unsquish(squishedNode).node;
    assert(unsquishedNode.text.font === 'test-font');
    compareSquished(squishedNode.node, unsquishedNode);
});

test("Asset node", () => {
    const gameNode = new GameNode.Asset({
        coordinates2d: ShapeUtils.rectangle(0, 0, 10, 10),
        assetInfo: {
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
    });
    const squishedNode = squish(gameNode);
    const unsquishedNode = unsquish(squishedNode).node;
    compareSquished(squishedNode.node, unsquishedNode);
});

test("Shape with shadow", () => {
    const gameNode = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(20, 20, 30, 30),
        fill: COLORS.WHITE,
        playerIds: [42],
        effects: {
            shadow: {
                color: COLORS.BLACK,
                blur: 6
            }
        }
    });

    const squishedNode = squish(gameNode);
    const unsquishedNode = unsquish(squishedNode).node;
    compareSquished(squishedNode.node, unsquishedNode);

});

test("Shape with onClick", () => {
    const gameNode = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(0, 0, 100, 100),
        fill: COLORS.GREEN,
        onClick: () => {
            console.log('some function');
        }
    });

    const squished = squish(gameNode);
    const unsquished = unsquish(squished).node;

    compareSquished(gameNode.node, unsquished);
});

test("Text with text input", () => {
    const gameNode = new GameNode.Text({
        textInfo: {
            text: 'ayy lmao',
            x: 40,
            y: 40,
            size: 1,
            align: 'center',
            color: COLORS.BLACK
        },
        input: {
            type: 'text',
            oninput: () => {
                console.log("I am handling text");
            }
        }
    });

    const squishedNode = squish(gameNode);
    const unsquishedNode = unsquish(squishedNode).node;
    compareSquished(gameNode.node, unsquishedNode);
});

test("scaled shape", () => {
    const gameNode = new GameNode.Shape({
        fill: COLORS.GREEN,
        coordinates2d: ShapeUtils.rectangle(0, 0, 100, 100),
        shapeType: Shapes.POLYGON
    });

    // A box taking up the entire space ((0, 0), (100, 100))
    // scaled down to 80%
    // .8 (x scale factor) * 100 (width) = 80
    // .8 (y scale factor) * 100 (height) = 80
    // This gets you the correct size.
    // To scale the position to re-center the data, we need to shift x and y by 1/2 of the amount of space we just removed in each direction.
    // So we removed 20 units from the width, and now we need to shift everything right 10 units to keep it horizontally centered.
    // Then we need to repeat this for the height.
    // This would result in the scaled top left corner being at (10, 10) and the bottom right corner at (90, 90)

    const squishedScaledNode = squish(gameNode, {x: .8, y: .8});
    const unsquishedNode = unsquish(squishedScaledNode).node;

    // top left
    assert(unsquishedNode.coordinates2d[0][0] == 10);
    assert(unsquishedNode.coordinates2d[0][1] == 10);

    // bottom right
    assert(unsquishedNode.coordinates2d[2][0] == 90);
    assert(unsquishedNode.coordinates2d[2][1] == 90);
});

test("scaled text", () => {
    const gameNode = new GameNode.Text({
        textInfo: {
            text: 'Hello, world!',
            x: 4,
            y: 20,
            size: 5,
            align: 'center',
            color: COLORS.RED
        }
    });

    const xScale = .6;
    const yScale = .5;

    const scaledTextSize = 5 * hypLength(xScale, yScale);

    const squishedScaledNode = squish(gameNode, {x: xScale, y: yScale});
    const unsquishedNode = unsquish(squishedScaledNode).node;

    assert(unsquishedNode.text.x.toFixed(2) === (4 * xScale + Math.round((1 - xScale) * 100) / 2).toFixed(2));
    assert(unsquishedNode.text.y.toFixed(2) === (20 * yScale + Math.round((1 - yScale) * 100) / 2).toFixed(2));

    assert(unsquishedNode.text.size.toFixed(2) === scaledTextSize.toFixed(2));
});

test("scaled asset node", () => {
    const gameNode = new GameNode.Asset({
        onClick: (player, x, y) => {
        },
        coordinates2d: ShapeUtils.rectangle(20, 60, 60, 20),
        assetInfo: {
            'some-asset-ref': {
                pos: {x: 20, y: 60},
                size: {x: 60, y: 20}
            }
        }
    });

    const squishedNode = squish(gameNode, {x: .85, y: .85});
    const unsquishedNode = unsquish(squishedNode).node;

    const asset = unsquishedNode.asset['some-asset-ref'];

    assert(asset.pos.x === (.85 * 20) + 7.5);
    assert(asset.pos.y === (.85 * 60) + 7.5);

    assert(asset.size.x === .85 * 60);
    assert(asset.size.y === .85 * 20);
});

test("big big text", () => {
    const gameNode = new GameNode.Text({
        textInfo: {
            text: 'I am going to write a whoooooole lot of text like more than 64 characters which is quite a bit. Not like a tweet long but still long, you know?',
            x: 4,
            y: 20,
            size: 5,
            align: 'center',
            color: COLORS.RED
        }
    });

    const xScale = .6;
    const yScale = .5;

    const scaledTextSize = 5 * hypLength(xScale, yScale);

    const squishedScaledNode = squish(gameNode, {x: xScale, y: yScale});
    const unsquishedNode = unsquish(squishedScaledNode).node;

    assert(unsquishedNode.text.x.toFixed(2) === (4 * xScale + Math.round((1 - xScale) * 100) / 2).toFixed(2));
    assert(unsquishedNode.text.y.toFixed(2) === (20 * yScale + Math.round((1 - yScale) * 100) / 2).toFixed(2));

    assert(unsquishedNode.text.size.toFixed(2) === scaledTextSize.toFixed(2));
});

// create one hundred nodes and ensure the memory is freed
test("allocate a bunch of nodes", () => {
    const initialMemUsage = process.memoryUsage();

    const nodeCount = Math.pow(10, 3);
    
    const root = new GameNode.Text({
            textInfo: {
                text: 'I am root',
                x: 4,
                y: 20,
                size: 5,
                align: 'center',
                color: COLORS.RED
            }
        });

    const sizeEstimate = squish(root).length;

    const fakeGame = new Game();
    fakeGame.getLayers = () => {
            return [
                {
                    root
                }
            ]
        };

    const squisher = new Squisher({game: fakeGame});
    squisher.addListener(() => {
        // necessary to hold the reference to the proxy that we should be revoking when we call delete
    });

    for (let i = 0; i < nodeCount; i++) {
        const gameNode = new GameNode.Text({
            textInfo: {
                text: 'I am going to write a whoooooole lot of text like more than 64 characters which is quite a bit. Not like a tweet long but still long, you know?',
                x: 4,
                y: 20,
                size: 5,
                align: 'center',
                color: COLORS.RED
            }
        });

        root.addChild(gameNode);
        root.removeChild(gameNode.node.id);
    }

    const postMemUsage = process.memoryUsage();
    assert(postMemUsage.heapTotal - initialMemUsage.heapTotal <= (.05 * initialMemUsage.heapTotal)); 
});

test("Simple shape with updates", () => {
    const base = rectNode({ x: 0, y: 0, width: 100, height: 100, fill: COLORS.RED });

    const game = new FakeGame([
        {
            root: base
        }
    ]);

    const squisher = new Squisher({ game });

    let updateCount = 0;
    // add listener so squisher cares about update
    squisher.addListener(() => {
        updateCount++;
    });
    
    const initialState = Array.from(squisher.state);
    assert(initialState.length === 1);

    verifyArrayEquality(unsquish(initialState[0]).node.fill, COLORS.RED);

    base.update({
        fill: COLORS.BLUE
    });

    const state2 = Array.from(squisher.state);
    verifyArrayEquality(unsquish(state2[0]).node.fill, COLORS.BLUE);

    base.update({
        fill: COLORS.GREEN
    });

    const state3 = Array.from(squisher.state);
    verifyArrayEquality(unsquish(state3[0]).node.fill, COLORS.GREEN);
});

test("id test", () => {
    const node = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(0, 0, 100, 100),
        id: 55559092036
    });
    const squished = squish(node);
    const unsquished = unsquish(squished);
    assert(unsquished.node.id == 55559092036);
});


