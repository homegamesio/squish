const { GameNode } = require('./GameNode');
const Shapes = require('./Shapes');
const ShapeUtils = require('./util/shapes');
const Colors = require('./Colors');
const Game = require('./Game');

const makePlane = (s) => {
            return new GameNode.Shape({
                shapeType: Shapes.POLYGON,
                coordinates2d: ShapeUtils.rectangle(0, 0, s, s),
                fill: Colors.COLORS.BLACK,
                onClick: (player, x, y) => {
                    console.log('I am the plane');
                }
            });
};

class ViewableGame extends Game {
    #plane;
    #fakeRoot;
    constructor(planeSize) {
        super();
        this.planeSize = planeSize;
        this.#plane = makePlane(this.planeSize);

        this.#fakeRoot = new GameNode.Shape({
            shapeType: Shapes.POLYGON,
            coordinates2d: ShapeUtils.rectangle(0, 0, 0, 0),
            fill: Colors.COLORS.BLACK,
        });

        this.#fakeRoot.addChild(this.#plane);

        this.layers = [
            {
                root: this.#fakeRoot
            }
        ];
    }

    getLayers() {
        return this.layers;
    }
    
    // addPlaneChildren(...children) {
    //     for (let childIndex in children) {
    //         // console.log('what is this');
    //         // console.log(childIndex);
    //         this.#plane.addChild(children[childIndex]);
    //         //this.#plane.addChildren(children);
    //     }
    // }

    updatePlaneSize(newSize) {
        // this.plane.
    }

    getPlane() {
        return this.#plane;
    }

    getViewRoot() {
        return this.#fakeRoot;
    }

}

module.exports = ViewableGame;

