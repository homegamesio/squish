const { squish, unsquish } = require('./src/squish');
const GameNode = require('./src/GameNode');
const Colors = require('./src/Colors');

const assert = require('assert');

const compareSquished = (preSquish, unsquished) => { 
    for (const key in preSquish) {
        if (key == 'handleClick' || key == 'children' || key == 'listeners' || key == 'asset') {
            continue;
        }
        try {
            if (preSquish[key] === undefined) {
                assert(unsquished[key] === undefined);
                continue;
            }
            if (Array.isArray(preSquish[key])) {
                const l1 = preSquish[key];
                const l2 = unsquished[key];
                for (let i = 0; i < l1.length; i++) {
                    assert(l1[i] === l2[i]);
                }
            } else if (preSquish[key].constructor === Object) {
                for (const k in preSquish[key]) {
                    if (preSquish[key][k].constructor === Object) {
                        for (const j in preSquish[key][k]) {
                            assert(preSquish[key][k][j] === unsquished[key][k][j]);
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
            size: 14
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
    compareSquished(gameNode, unsquishedNode);
};

testSimpleGameNode1();
testComplexGameNode1();

console.log('nice');
