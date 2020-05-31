const listenable = require("./util/listenable");
const InternalGameNode = require('./InternalGameNode');
const Shapes = require('./Shapes');

const gameNode = (color, onClick, coordinates2d, border, fill, text, asset, playerId, effects, input) => {
    const node = new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerId, effects, input);
    return listenable(node, node.onStateChange.bind(node));
};

class Shape {
    constructor(color, shapeType, shapeInfo, playerId, onClick, effects, input) {
        this.node = gameNode(color, onClick, shapeInfo.coordinates2d, shapeInfo.border, shapeInfo.fill, null, null, playerId, effects, input);
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
    constructor(textInfo, playerId, input) {
        this.node = gameNode(null, null, null, null, null, textInfo, null, playerId, null, input);
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
    constructor(onClick, coordinates2d, assetInfo, playerId) {
        this.node = gameNode(null, onClick, coordinates2d, null, null, null, assetInfo, playerId);
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

module.exports = GameNode;
