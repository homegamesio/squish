import { squish, unsquish } from './src/squish';
import { gameNode, GameNode } from './src/GameNode';
import { COLORS, randomColor } from './src/Colors';
import Game from './src/Game';
import Shapes from './src/Shapes';
import { rectangle, triangle } from './src/util/shapes';
import { terrainGenerator } from './src/terrain';

module.exports = {
    squish,
    unsquish,
    gameNode,
    Game,
    GameNode,
    Colors: { COLORS, randomColor },
    Shapes,
    ShapeUtils: { rectangle, triangle },
    TerrainGenerator: terrainGenerator
};
