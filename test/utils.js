const Game = require('../src/Game');
const { COLORS } = require('../src/Colors');
const { GameNode } = require('../src/GameNode');
const ShapeUtils = require('../src/util/shapes');
const Shapes = require('../src/Shapes');
const subtypes = require('../src/subtypes');

const assert = require('assert');

class FakeGame extends Game {
    static metadata() {
        return {
            name: 'Test game'
        };
    }

    constructor(layers) {
        super();
        this.layers = layers;
    }

    getLayers() {
        return this.layers;
    }
}

const verifyArrayEquality = (actual, expected) => {
    console.log(`comparing actual: ${actual} with expected: ${expected}`);

    assert(expected.length == actual.length);
    
    for (let i = 0; i < expected.length; i++) {
        if (expected[i].length && actual[i].length) {
            verifyArrayEquality(expected[i], actual[i]);
        } else {
            assert(expected[i] === actual[i]);
        }
    }
};

const polygonNode = ({ coordinates, fill }) => {
    return new GameNode.Shape({
        fill: fill,
        coordinates2d: coordinates,
        shapeType: Shapes.POLYGON
    });
};

const circleNode = ({ center, radius, fill }) => {
    return new GameNode.Shape({
        fill,
        coordinates2d: [center.x, center.y, radius],
        shapeType: Shapes.CIRCLE
    });
}

const rectNode = ({ x, y, width, height, fill = COLORS.RED }) => {
    return new GameNode.Shape({
        fill: fill,
        coordinates2d: ShapeUtils.rectangle(x, y, width, height),
        shapeType: Shapes.POLYGON
    });
};

const textNode = ({ text, x, y, align, color }) => {
    return new GameNode.Text({
        textInfo: {
            x,
            y,
            align,
            color,
            text
        }
    });
};

const lineNode = ({ color, coords }) => {
    return new GameNode.Shape({
        color,
        coordinates2d: coords,
        shapeType: Shapes.LINE
    });
};

module.exports = {
    FakeGame,
    verifyArrayEquality,
    rectNode,
    polygonNode,
    circleNode,
    textNode,
    lineNode
}
