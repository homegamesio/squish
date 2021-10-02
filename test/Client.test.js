const { COLORS } = require("../src/Colors");
const assert = require("assert");
const Squisher = require('../src/Squisher');

const { FakeClient, FakeGame, verifyArrayEquality, rectNode, polygonNode, circleNode } = require('./utils');

test("Client rendering a rectangle", () => {
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

    const squisher = new Squisher({ game });//{ game, layers: ['thang', 'stuff', 'ting'] });

    // const client = new FakeClient({ squisher, width: 800, height: 600 });

    // base.node.fill = 'ayy lmao';
    
});
