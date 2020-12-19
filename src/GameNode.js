const listenable = require("./util/listenable");
const InternalGameNode = require('./InternalGameNode');
const Shapes = require('./Shapes');
const StateSignals = require('./util/state-codes');

const gameNode = (color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, buf, stateSignal, holdHandlers) => {
    const node = new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, buf, stateSignal, holdHandlers);
    return listenable(node, node.onStateChange.bind(node));
};

class State { 
    constructor(stateSignal, playerIds) {
        this.node = gameNode(null, null, null, null, null, null, null, playerIds, null, null, null, stateSignal);
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

class Audio {
    constructor(playerIds, buf) {
        this.node = gameNode(null, null, null, null, null, null, null, playerIds, null, null, buf);
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

class Shape {
    constructor(color, shapeType, shapeInfo, playerIds, onClick, effects, input, holdHandlers) {
        this.node = gameNode(color, onClick, shapeInfo.coordinates2d, shapeInfo.border, shapeInfo.fill, null, null, playerIds, effects, input, null, null, holdHandlers);
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
    Text,
    Audio,
    State
};

// todo: fix this hack
module.exports = {gameNode, GameNode};
