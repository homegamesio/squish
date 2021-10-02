const { COLORS } = require("../src/Colors");
const assert = require("assert");
const Squisher = require('../src/Squisher');
const { squish, unsquish } = require('../src/squish');
const { FakeGame, verifyArrayEquality, rectNode, polygonNode, circleNode } = require('./utils');

test("two layers on a base - square over square", () => {
    const base = rectNode({ x: 0, y: 0, width: 100, height: 100, fill: COLORS.RED });
    const layerOne = rectNode({ x: 40, y: 40, width: 20, height: 20, fill: COLORS.BLUE });
    const layerTwo = rectNode({ x: 45, y: 45, width: 10, height: 10, fill: COLORS.GREEN });

    const game = new FakeGame([
        {
            root: base
        },
        {
            root: layerOne
        },
        {
            root: layerTwo
        }
    ]);

    const squisher = new Squisher({ game });
    
    assert(squisher.state.length === 3);
    verifyArrayEquality(squisher.state[0], squish(base));
    verifyArrayEquality(squisher.state[1], squish(layerOne));
    verifyArrayEquality(squisher.state[2], squish(layerTwo)); 
});

test("test layer with child added", () => {
    const base = rectNode({ x: 0, y: 0, width: 100, height: 100, fill: COLORS.RED });
    const layer = rectNode({ x: 40, y: 40, width: 20, height: 20, fill: COLORS.BLUE });

    const game = new FakeGame([
        {
            root: base
        },
        {
            root: layer
        }
    ]);

    const squisher = new Squisher({ game });
    
    const initialState = Array.from(squisher.state);
    console.log(initialState);
    assert(initialState.length === 2);
    verifyArrayEquality(initialState[0], squish(base));
    verifyArrayEquality(initialState[1], squish(layer));

    const child = rectNode({ x: 50, y: 50, height: 25, width: 25, fill: COLORS.WHITE });

    // adding a child should trigger an update in the squisher and result in a new state
    layer.addChild(child);

    const expectedLayerValue = [squish(layer), squish(child)].flat();
    const stateWithChild = Array.from(squisher.state);
    assert(stateWithChild.length === 3);
    verifyArrayEquality(stateWithChild[0], squish(base));
    verifyArrayEquality(stateWithChild[1], squish(layer));
    verifyArrayEquality(stateWithChild[2], squish(child));
});
