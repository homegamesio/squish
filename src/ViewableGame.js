const { GameNode } = require('./GameNode');
const Shapes = require('./Shapes');
const ShapeUtils = require('./util/shapes');
const Colors = require('./Colors');
const Game = require('./Game');

const makePlane = (s) => {
        return new GameNode.Shape({
            shapeType: Shapes.POLYGON,
            coordinates2d: ShapeUtils.rectangle(0, 0, s, s)
        });
};

class ViewableGame extends Game {
    #plane;
    #fakeRoot;
    #planeSize;
    constructor(planeSize) {
        super();
        this.#planeSize = planeSize;
        this.#plane = makePlane(this.planeSize);

        this.#fakeRoot = new GameNode.Shape({
            shapeType: Shapes.POLYGON,
            coordinates2d: ShapeUtils.rectangle(0, 0, 0, 0),
            fill: Colors.COLORS.BLACK,
        });

        // this.#fakeRoot.addChild(this.#plane);

        this.layers = [
            {
                root: this.#fakeRoot
            }
        ];
    }

    updatePlaneSize(s) {
        this.#planeSize = s;
        this.#plane.node.coordinates2d = ShapeUtils.rectangle(0, 0, s, s);
    }

    getLayers() {
        return this.layers;
    }

    getPlane() {
        return this.#plane;
    }

    getPlaneSize() {
        return this.#planeSize;
    }

    getViewRoot() {
        return this.#fakeRoot;
    }

}

module.exports = ViewableGame;

