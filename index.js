const { squish, unsquish } = require('./src/squish');
const { gameNode, GameNode } = require('./src/GameNode');
const InternalGameNode = require('./src/InternalGameNode');
const Colors = require('./src/Colors');
const Game = require('./src/Game');
const ViewableGame = require('./src/ViewableGame');
const Shapes = require('./src/Shapes');
const shapeUtils = require('./src/util/shapes');
const viewUtils = require('./src/util/views');
const { terrainGenerator } = require('./src/terrain');
const subtypes = require('./src/subtypes');
const Squisher = require('./src/Squisher');
const GeometryUtils = require('./src/util/geometry');

module.exports = {
    squish,
    unsquish,
    gameNode,
    subtypes,
    Game,
    ViewableGame,
    GameNode,
    Colors,
    Shapes,
    Squisher,
    ShapeUtils: shapeUtils,
    ViewUtils: viewUtils,
    TerrainGenerator: terrainGenerator,
    GeometryUtils
};
