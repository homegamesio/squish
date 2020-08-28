const { squish, unsquish } = require('./src/squish');
const { gameNode, GameNode } = require('./src/GameNode');
const InternalGameNode = require('./src/InternalGameNode');
const Colors = require('./src/Colors');
const Game = require('./src/Game');
const Shapes = require('./src/Shapes');
const shapeUtils = require('./src/util/shapes');

module.exports = {
    squish,
    unsquish,
    gameNode,
    Game,
    GameNode,
    Colors,
    Shapes,
    ShapeUtils: shapeUtils
};
