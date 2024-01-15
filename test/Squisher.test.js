const { COLORS } = require("../src/Colors");
const assert = require("assert");
const Squisher = require('../src/Squisher');
const { unsquish } = require('../src/squish');

const { FakeGame, verifyArrayEquality, rectNode, textNode, polygonNode, circleNode, lineNode } = require('./utils');

test("squisher listener", () => {

    const root = lineNode({coords: [[20, 20], [80, 80]], color: COLORS.ORANGE});
    
    const game = new FakeGame([ 
        {
            root,
            scale: {
                x: 1,
                y: 1
            }
        } 
    ]);

    const squisher = new Squisher({ game });

    let timesInvoked = 0;

    squisher.addListener((newSquishedState) => {
        if (timesInvoked === 0) {
            assert(newSquishedState.length == 1);
            const updatedRoot = unsquish(newSquishedState[0]);
            verifyArrayEquality(updatedRoot.node.color, COLORS.BLACK);
        } else if (timesInvoked === 1) {
            assert(newSquishedState.length == 1);
            const updatedRoot = unsquish(newSquishedState[0]);
            verifyArrayEquality(updatedRoot.node.color, COLORS.GREEN);
        }
        timesInvoked++;
    });

    assert(timesInvoked === 0);

    root.node.color = COLORS.BLACK;
    root.node.onStateChange();

    assert(timesInvoked === 1);

    root.node.color = COLORS.GREEN;
    root.node.onStateChange();

    assert(timesInvoked === 2);
});


