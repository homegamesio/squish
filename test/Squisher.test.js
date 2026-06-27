const { COLORS } = require("../src/Colors");
const assert = require("assert");
const Squisher = require('../src/Squisher');
const { unsquish } = require('../src/squish');

const { FakeGame, verifyArrayEquality, rectNode, textNode, polygonNode, circleNode, lineNode } = require('./utils');

test("squisher listener coalesces state changes", () => {

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
    let lastState = null;

    squisher.addListener((newSquishedState) => {
        timesInvoked++;
        lastState = newSquishedState;
    });

    assert(timesInvoked === 0);

    // A burst of mutations in the same turn is deferred — nothing broadcast yet.
    root.node.color = COLORS.BLACK;
    root.node.onStateChange();
    root.node.color = COLORS.GREEN;
    root.node.onStateChange();

    assert(timesInvoked === 0);

    // flush() coalesces the burst into a single broadcast with the final state.
    squisher.flush();
    assert(timesInvoked === 1);
    assert(lastState.length == 1);
    verifyArrayEquality(unsquish(lastState[0]).node.color, COLORS.GREEN);

    // flush() with nothing pending is a no-op.
    squisher.flush();
    assert(timesInvoked === 1);
});


