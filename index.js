const { squish, unsquish } = require('./src/squish');
const { gameNode, GameNode } = require('./src/GameNode');
const InternalGameNode = require('./src/InternalGameNode');
const Colors = require('./src/Colors');
const Game = require('./src/Game');
const Shapes = require('./src/Shapes');
const shapeUtils = require('./src/util/shapes');
const { terrainGenerator } = require('./src/terrain');
const subtypes = require('./src/subtypes');
const Squisher = require('./src/Squisher');

module.exports = {
    squish,
    unsquish,
    gameNode,
    subtypes,
    Game,
    GameNode,
    Colors,
    Shapes,
    Squisher,
    ShapeUtils: shapeUtils,
    TerrainGenerator: terrainGenerator
};
