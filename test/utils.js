const Game = require('../src/Game');
const { COLORS } = require('../src/Colors');
const { GameNode } = require('../src/GameNode');
const ShapeUtils = require('../src/util/shapes');
const Shapes = require('../src/Shapes');
const subtypes = require('../src/subtypes');

const assert = require('assert');

class FakeClient {
    constructor({ squisher, width, height }) {
        this.renderedFrameCount = 0;
        this.squisher = squisher;

        this.display = new Array(width);
        for (let i = 0; i < width; i++) {
            this.display[i] = new Array(height);
        }
        
        this.clientId = this.squisher.registerListener(this.onSquisherUpdate.bind(this));
    }

    onSquisherUpdate(newState) {
        this.render(newState);
        this.renderedFrameCount++;
    }

    render(state) {
        for (const nodeIndex in state) {
            const gameNode = this.squisher.unsquish(state[nodeIndex]);
            if (gameNode.node.subType == subtypes.SHAPE_2D_POLYGON) {
                const coords = gameNode.node.coordinates2d;
                for (let i = 0; i < coords.length; i += 2) {
                    console.log('need to traverse to ' + coords[i] + ', ' + coords[i + 1]);
                }
            }
        }
    }
}

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
        // console.log("my layers");
        // console.log(this.layers);
        // console.log(this.layers[0].root);
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
    FakeClient,
    verifyArrayEquality,
    rectNode,
    polygonNode,
    circleNode,
    textNode,
    lineNode
}
