const { COLORS } = require("../src/Colors");
const assert = require("assert");
const Squisher = require('../src/Squisher');
const { unsquish } = require('../src/squish');

const { FakeGame, verifyArrayEquality, rectNode, textNode, polygonNode, circleNode, lineNode } = require('./utils');
const { GameNode } = require('../src/GameNode');
const Shapes = require('../src/Shapes');
const ShapeUtils = require('../src/util/shapes');

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

test("squisher does not crash on an asset node with an unregistered key", () => {
    // Reproduces the mid-upload case: a GameNode.Asset referencing a key that
    // isn't in gameAssets yet. Must not throw while building per-player frames.
    const root = rectNode({ x: 0, y: 0, width: 100, height: 100 });

    const scoped = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(0, 0, 10, 10),
        fill: COLORS.RED,
        playerIds: [1]
    });

    const assetNode = new GameNode.Asset({
        coordinates2d: ShapeUtils.rectangle(0, 0, 10, 10),
        assetInfo: { 'unregistered-key': { pos: { x: 2, y: 2 }, size: { x: 5, y: 5 } } }
    });

    root.addChild(scoped);
    root.addChild(assetNode);

    const game = new FakeGame([{ root, scale: { x: 1, y: 1 } }]);
    const squisher = new Squisher({ game });

    squisher.squish(game.getLayers()); // must not throw
    const frame = squisher.getPlayerFrame(1);
    // Unregistered asset is treated as non-audio, so it's still delivered.
    assert(frame && frame.length >= 1);
});

test("player frame includes shared nodes squished before the player's first scoped node", () => {
    // The root background and an early shared sibling precede the scoped
    // node in traversal order. The player's frame must still contain them
    // (seeded on frame creation), in draw order.
    const root = rectNode({ x: 0, y: 0, width: 100, height: 100, fill: COLORS.WHITE });
    const earlyShared = rectNode({ x: 1, y: 1, width: 5, height: 5, fill: COLORS.GREEN });
    const scoped = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(2, 2, 5, 5),
        fill: COLORS.BLUE,
        playerIds: [7]
    });
    const lateShared = rectNode({ x: 3, y: 3, width: 5, height: 5, fill: COLORS.RED });

    root.addChild(earlyShared);
    root.addChild(scoped);
    root.addChild(lateShared);

    const game = new FakeGame([{ root, scale: { x: 1, y: 1 } }]);
    const squisher = new Squisher({ game });

    const frame = squisher.getPlayerFrame(7);
    assert(frame.length === 4);
    const fills = frame.map(squished => unsquish(squished).node.fill);
    verifyArrayEquality(fills[0], COLORS.WHITE);
    verifyArrayEquality(fills[1], COLORS.GREEN);
    verifyArrayEquality(fills[2], COLORS.BLUE);
    verifyArrayEquality(fills[3], COLORS.RED);
});

test("squisher withholds muted audio from a player-scoped subtree", () => {
    const root = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(0, 0, 100, 100),
        fill: COLORS.WHITE,
        playerIds: [1]
    });

    const audioNode = new GameNode.Asset({
        coordinates2d: ShapeUtils.rectangle(0, 0, 10, 10),
        assetInfo: { 'song': { pos: { x: 0, y: 0 }, size: { x: 1, y: 1 } } }
    });
    root.addChild(audioNode);

    const game = new FakeGame([{ root, scale: { x: 1, y: 1 } }]);
    const squisher = new Squisher({ game });
    squisher.gameAssets = { song: { info: { type: 'audio' } } };

    // Sound on (default): the audio node reaches player 1.
    squisher.squish(game.getLayers());
    const withSound = squisher.getPlayerFrame(1).length;

    // Mute player 1: the audio node is withheld even though it's player-scoped.
    squisher.updatePlayerSettings(1, { SOUND: { enabled: false } });
    squisher.squish(game.getLayers());
    const muted = squisher.getPlayerFrame(1).length;

    assert(muted === withSound - 1);
});


