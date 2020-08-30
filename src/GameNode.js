const listenable = require("./util/listenable");
const InternalGameNode = require('./InternalGameNode');
const Shapes = require('./Shapes');

const gameNode = (color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input) => {
    const node = new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input);
    return listenable(node, node.onStateChange.bind(node));
};

class Shape {
    constructor(color, shapeType, shapeInfo, playerIds, onClick, effects, input) {
        this.node = gameNode(color, onClick, shapeInfo.coordinates2d, shapeInfo.border, shapeInfo.fill, null, null, playerIds, effects, input);
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
    constructor(textInfo, playerIds, input) {
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
    constructor(onClick, coordinates2d, assetInfo, playerIds) {
        this.node = gameNode(null, onClick, coordinates2d, null, null, null, assetInfo, playerIds);
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
    Text
};

// todo: fix this hack
module.exports = {gameNode, GameNode};
