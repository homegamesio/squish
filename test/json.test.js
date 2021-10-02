const { COLORS } = require("../src/Colors");
const assert = require("assert");
const Squisher = require('../src/Squisher');
const { unsquish } = require('../src/squish');

const { FakeGame, verifyArrayEquality, rectNode, textNode, polygonNode, circleNode, lineNode } = require('./utils');

test("90% scale rectangles", () => {

    const root = rectNode({ x: 0, y: 0, width: 100, height: 100, fill: COLORS.RED });
    const topLeftCorner = rectNode({ x: 0, y: 0, width: 50, height: 50, fill: COLORS.BLUE });
    const topRightCorner = rectNode({ x: 50, y: 0, width: 50, height: 50, fill: COLORS.GREEN });    
    const bottomRightCorner = rectNode({ x: 50, y: 50, width: 50, height: 50, fill: COLORS.BLACK });
    const bottomLeftCorner = rectNode({ x: 0, y: 50, width: 50, height: 50, fill: COLORS.PURPLE});
  
    root.addChildren(topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner);

    const childLayer = rectNode({ x: 0, y: 0, width: 0, height: 0 });
    const topLeftThing = textNode({ text: 'ayy lmao', x: 25, y: 25, color: COLORS.WHITE, align: 'center' });
    const topRightThing = circleNode({center: {x: 75, y: 25 }, radius: 10, fill: COLORS.WHITE});//lineNode({coords: [[60, 20], [80, 20]], color: COLORS.ORANGE});
    topRightThing.addChild(lineNode({coords: [[60, 20], [80, 20]], color: COLORS.ORANGE}));
    const bottomRightThing = circleNode({center: {x: 75, y: 75 }, radius: 10, fill: COLORS.PINK });
    const bottomLeftThing = rectNode({ x: 12.5, y: 62.5, width: 25, height: 25, fill: COLORS.RED });

    childLayer.addChildren(topLeftThing, topRightThing, bottomRightThing, bottomLeftThing);

    const game = new FakeGame([
        {
            root, 
            scale: {
                x: 1,
                y: 1
            }
        },
        {
            root: childLayer,
            scale: {
                x: 1,
                y: 1
            }
        }
    ]);

    const squisher = new Squisher({ game });
    
 //   const nodesToRender = squisher.squish();

//    assert(nodesToRender.length == 5);

    // console.log('here is json');
    // console.log(squisher.getJson());
});


