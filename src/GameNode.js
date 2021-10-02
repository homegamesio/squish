const listenable = require("./util/listenable");
const InternalGameNode = require('./InternalGameNode');
const Shapes = require('./Shapes');
const SUBTYPES = require('./subtypes');

const gameNode = (color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, subtype) => {
    const node = new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, subtype);
    return listenable(node, node.onStateChange.bind(node));
};

class Shape {
    constructor({ color, onClick, shapeType, coordinates2d, border, fill, playerIds, effects, input, node }) {
        if ((!coordinates2d || !shapeType) && !(node)) {
            throw new Error("Shape requires coordinates2d and shapeType");
        } 

        const shapeTypeToSubtype = {
            [Shapes.CIRCLE]: SUBTYPES.SHAPE_2D_CIRCLE,
            [Shapes.POLYGON]: SUBTYPES.SHAPE_2D_POLYGON,
            [Shapes.LINE]: SUBTYPES.SHAPE_2D_LINE 
        };

        if (node) {
            this.node = node;
        } else {
            this.node = gameNode(color, onClick, coordinates2d, border, fill, null, null, playerIds, effects, input, shapeTypeToSubtype[shapeType]);
        }

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
    constructor({ textInfo, playerIds, input, node}) {
        if (!textInfo && !node) {
            throw new Error("Text node requires textInfo");
        }
        
        if (node) {
            this.node = node;
        } else {
            this.node = gameNode(null, null, null, null, null, textInfo, null, playerIds, null, input, SUBTYPES.TEXT);
        }

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
    constructor({ assetInfo, onClick, coordinates2d, playerIds, effects, node }) {
        if (!assetInfo && !node) {
            throw new Error("Asset node requires assetInfo");
        }

        if (node) {
            this.node = node;
        } else {
            this.node = gameNode(null, onClick, coordinates2d, null, null, null, assetInfo, playerIds, effects, null, SUBTYPES.ASSET);
        }

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
