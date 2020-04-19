const { squish, unsquish } = require('../src/squish');
const GameNode = require('../src/GameNode');
const Colors = require('../src/Colors');

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

const testSimpleGameNode1 = () => {
    const gameNode = GameNode(Colors.RED);
    const squishedGameNode = squish(gameNode);
    const unsquishedGameNode = unsquish(squishedGameNode);
    compareSquished(gameNode, unsquishedGameNode);
};

const testComplexGameNode1 = () => {
    const gameNode = GameNode(Colors.GREEN,
        null,
        {
            x: 20.99,
            y: 40.20
        },
        {
            x: 20.40,
            y: 19.55
        },
        {
            text: "ayy lmao",
            x: 40,
            y: 40,
            size: 14,
            color: Colors.BLUE
        },
        {
            "someassetref": {
                pos: {
                    x: 1.24,
                    y: 2.41
                },
                size: {
                    x: 10.42,
                    y: 4.21
                }
            }
        },
        42);

    const squishedNode = squish(gameNode);

    const unsquishedNode = unsquish(squishedNode);
    console.log(gameNode.text.color);
    console.log(unsquishedNode.text.color);
};

const testEffects = () => {
    const gameNode = GameNode(
        Colors.BLUE,
        null,
        {
            x: 10,
            y: 10
        },
        {
            x: 20,
            y: 20
        }, 
        null,
        null,
        0,
        {
            'shadow': {
                'color': Colors.BLACK,
                'blur': 12
            }
        }
    );

    const squished = squish(gameNode);
    const unsquished = unsquish(squished);

    compareSquished(gameNode, unsquished);
};

const testOnClick = () => {
    const gameNode = GameNode(Colors.GREEN, () => {
        console.log('some function');
    }, {x: 0, y: 0}, {x: 100, y: 100});

    const squished = squish(gameNode);
    const unsquished = unsquish(squished);

    compareSquished(gameNode, unsquished);

};

const testInput = () => {
    const gameNode = GameNode(Colors.BLUE, null, {x: 0, y: 0}, {x: 100, y: 100}, null, null, 50, null, {
        type: 'text',
        oninput: (thing) => {
        }
    });

    const squished = squish(gameNode);
    const unsquished = unsquish(squished);

    compareSquished(gameNode, unsquished);
};

testSimpleGameNode1();
testComplexGameNode1();
testEffects();
testOnClick();
testInput();

console.log('nice');
