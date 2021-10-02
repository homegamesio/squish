const { COLORS } = require("../src/Colors");
const assert = require("assert");
const Squisher = require('../src/Squisher');
const { unsquish } = require('../src/squish');

const { FakeGame, verifyArrayEquality, rectNode, textNode, polygonNode, circleNode, lineNode } = require('./utils');

test("90% scale rectangles", () => {

    /* 
    * Red root taking up entirety of container. 
    * Four child nodes, each of a different color taking up a quarter of the container.
    * If displayed on a screen, red would not be visible since children cover 100% of the overall space
    */

    const root = rectNode({ x: 0, y: 0, width: 100, height: 100, fill: COLORS.RED });
    const topLeftCorner = rectNode({ x: 0, y: 0, width: 50, height: 50, fill: COLORS.BLUE });
    const topRightCorner = rectNode({ x: 50, y: 0, width: 50, height: 50, fill: COLORS.GREEN });    
    const bottomRightCorner = rectNode({ x: 50, y: 50, width: 50, height: 50, fill: COLORS.BLACK });
    const bottomLeftCorner = rectNode({ x: 0, y: 50, width: 50, height: 50, fill: COLORS.PURPLE});
    
    root.addChildren(topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner);

    const game = new FakeGame([
        {
            root, 
            scale: {
                x: .9,
                y: .9
            }
        }
    ]);

    const squisher = new Squisher({ game });
    
    const nodesToRender = squisher.squish();

    assert(nodesToRender.length == 5);
    
    const rootUnsquished = unsquish(nodesToRender[0]);
    const topLeftUnsquished = unsquish(nodesToRender[1]);
    const topRightUnsquished = unsquish(nodesToRender[2]);
    const bottomRightUnsquished = unsquish(nodesToRender[3]);
    const bottomLeftUnsquished = unsquish(nodesToRender[4]);

    const rootCoords = rootUnsquished.node.coordinates2d;
    const topLeftCoords = topLeftUnsquished.node.coordinates2d;
    const topRightCoords = topRightUnsquished.node.coordinates2d;
    const bottomRightCoords = bottomRightUnsquished.node.coordinates2d;
    const bottomLeftCoords = bottomLeftUnsquished.node.coordinates2d;
    

    /* 
    * Scaled 90% should mean centered with 5% margins
    * Draw path starts at the top left, should match: 
    * (5, 5), (95, 5), (95, 95), (5, 95), (5, 5)
    */ 
    verifyArrayEquality(rootCoords, [
        [5, 5],
        [95, 5],
        [95, 95],
        [5, 95],
        [5, 5]
    ]);

    /*
    * width is 45, since it was 50% of the container, now scaled down to 90% (0.9 * .5 == 0.45)
    * same as height
    */
    verifyArrayEquality(topLeftCoords, [
        [5, 5],
        [50, 5],
        [50, 50],
        [5, 50],
        [5, 5]
    ]);
    
    verifyArrayEquality(topRightCoords, [
        [50, 5],
        [95, 5],
        [95, 50],
        [50, 50],
        [50, 5]
    ]);

    verifyArrayEquality(bottomRightCoords, [
        [50, 50],
        [95, 50],
        [95, 95],
        [50, 95],
        [50, 50]
    ]);

    verifyArrayEquality(bottomLeftCoords, [
        [5, 50],
        [50, 50],
        [50, 95],
        [5, 95],
        [5, 50]
    ]);
});

test("50% scale triangle", () => {

    const root = polygonNode({coordinates: [20, 20, 30, 30, 10, 30, 20, 20], fill: COLORS.GREEN });
    
    const game = new FakeGame([
        {
            root,
            scale: {
                x: .5,
                y: .5
            }
        } 
    ]);

    const squisher = new Squisher({ game });
    
    const nodesToRender = squisher.squish();

    assert(nodesToRender.length == 1);
    
    const rootUnsquished = unsquish(nodesToRender[0]);

    const rootCoords = rootUnsquished.node.coordinates2d;

    /*
    * 50% scale means we're expecting half of the width & height, plus a margin of 25% on each edge of the container 
    * (to account for the full 100% of the container)
    */
    verifyArrayEquality(rootCoords, [
        [35, 35],
        [40, 40],
        [30, 40],
        [35, 35]
    ]);

});

test("75% scale circle", () => {

    const root = circleNode({center: {x: 50, y: 50 }, radius: 10, fill: COLORS.PINK });
    
    const game = new FakeGame([ 
        {
            root,
            scale: {
                x: .75,
                y: .75
            }
        } 
    ]);

    const squisher = new Squisher({ game });
    const nodesToRender = squisher.squish();
    
    assert(nodesToRender.length == 1);
    
    const rootUnsquished = unsquish(nodesToRender[0]);

    const rootCoords = rootUnsquished.node.coordinates2d;

    /*
    * 50% scale means we're expecting half of the width & height, plus a margin of 25% on each edge of the container 
    * (to account for the full 100% of the container)
    */
    verifyArrayEquality(rootCoords, [
        50, 50, 7.5
    ]);

});

test('ayy lmao', () => {

    const root = rectNode({ x: 0, y: 0, width: 100, height: 100, fill: COLORS.RED });
    const topLeftCorner = rectNode({ x: 0, y: 0, width: 50, height: 50, fill: COLORS.BLUE });
    const topRightCorner = rectNode({ x: 50, y: 0, width: 50, height: 50, fill: COLORS.GREEN });    
    const bottomRightCorner = rectNode({ x: 50, y: 50, width: 50, height: 50, fill: COLORS.BLACK });
    const bottomLeftCorner = rectNode({ x: 0, y: 50, width: 50, height: 50, fill: COLORS.PURPLE});

    const testTextNode = textNode({ text: 'ayy lmao', x: 75, y: 75, color: COLORS.WHITE, align: 'center' });
    bottomRightCorner.addChild(testTextNode);
    
    root.addChildren(topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner);

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

    const squishedLayers = squisher.state;

});

test("a line", () => {

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
    const nodesToRender = squisher.squish();
    
    assert(nodesToRender.length == 1);
    
    const rootUnsquished = unsquish(nodesToRender[0]);

    const rootCoords = rootUnsquished.node.coordinates2d;

    /*
    * 50% scale means we're expecting half of the width & height, plus a margin of 25% on each edge of the container 
    * (to account for the full 100% of the container)
    */
    verifyArrayEquality(rootCoords, [
        [20, 20], [80, 80]
    ]);

});


