const listenable = require("./util/listenable");
const InternalGameNode = require('./InternalGameNode');
const Shapes = require('./Shapes');

const gameNode = (color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, type) => {
    const node = new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, type);
    return listenable(node, node.onStateChange.bind(node));
};

class Circle {
    constructor({centerX, centerY, radius, fill, stroke, onClick}) {
        console.log('you want a circle');
        console.log(centerX);
        console.log(centerY);
        console.log(radius);
        console.log(fill);
        console.log(stroke);

        this.node = gameNode(stroke, onClick, )
    }
}

class Shape {
    constructor({ color, onClick, shapeType, coordinates2d, border, fill, playerIds, effects, input }) {
        if (!coordinates2d || !shapeType) {
            throw new Error("Shape requires coordinates2d and shapeType");
        }

        this.node = gameNode(color, onClick, coordinates2d, border, fill, null, null, playerIds, effects, input);
        this.id = this.node.id;
    }

    addChild(child) {
        this.node.addChild(child);
    }

    addChildren(...nodes) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex]);
        }
    }

    removeChild(nodeId) {
        this.node.removeChild(nodeId);
    }

    addListener(listener) {
        this.node.addListener(listener);
    }

    clearChildren(excludedNodeIds) {
        this.node.clearChildren(excludedNodeIds);
    }
}

class Text {
    constructor({ textInfo, playerIds, input }) {
        if (!textInfo) {
            throw new Error("Text node requires textInfo");
        }

        this.node = gameNode(null, null, null, null, null, textInfo, null, playerIds, null, input);
        this.id = this.node.id;
    }

    addChild(child) {
        this.node.addChild(child);
    }

    addChildren(...nodes) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex]);
        }
    }

    removeChild(nodeId) {
        this.node.removeChild(nodeId);
    }

    addListener(listener) {
        this.node.addListener(listener);
    }

    clearChildren(excludedNodeIds) {
        this.node.clearChildren(excludedNodeIds);
    }
}

class Asset {
    constructor({ assetInfo, onClick, coordinates2d, playerIds, effects }) {
        if (!assetInfo) {
            throw new Error("Asset node requires assetInfo");
        }
        this.node = gameNode(null, onClick, coordinates2d, null, null, null, assetInfo, playerIds, effects);
        this.id = this.node.id;
    }

    addChild(child) {
        this.node.addChild(child);
    }

    addChildren(...nodes) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex]);
        }
    }

    removeChild(nodeId) {
        this.node.removeChild(nodeId);
    }

    addListener(listener) {
        this.node.addListener(listener);
    }

    clearChildren(excludedNodeIds) {
        this.node.clearChildren(excludedNodeIds);
    }


}

const GameNode = {
    Asset,
    Shape,
    Text,
    Circle
};

// todo: fix this hack
module.exports = {gameNode, GameNode};
