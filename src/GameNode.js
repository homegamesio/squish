const listenable = require("./util/listenable");
const InternalGameNode = require('./InternalGameNode');
const Shapes = require('./Shapes');
const SUBTYPES = require('./subtypes');

const shapeTypeToSubtype = {
    [Shapes.CIRCLE]: SUBTYPES.SHAPE_2D_CIRCLE,
    [Shapes.POLYGON]: SUBTYPES.SHAPE_2D_POLYGON,
    [Shapes.LINE]: SUBTYPES.SHAPE_2D_LINE 
};

const subtypeToShapeType = {
    [SUBTYPES.SHAPE_2D_CIRCLE]: Shapes.CIRCLE,
    [SUBTYPES.SHAPE_2D_POLYGON]: Shapes.POLYGON,
    [SUBTYPES.SHAPE_2D_LINE]: Shapes.LINE 
};

const gameNode = (color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, subtype, id) => {
    const node = new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, subtype, id);
    return listenable(node, node.onStateChange.bind(node));
};

class BaseNode {
    constructor({color, onClick, coordinates2d, border, fill, textInfo, assetInfo, playerIds, effects, input, subtype, node, id}) {
        if (node) {
            this.node = node;
        } else {
            this.node = gameNode(color, onClick, coordinates2d, border, fill, textInfo, assetInfo, playerIds, effects, input, subtype, id);
        }

        this.id = this.node.id;
    }

    showFor(playerId) {
        console.log('show was');
        console.log(this.node.playerIds);

        const playerIdIndex = this.node.playerIds.indexOf(playerId);
        const zeroIndex = this.node.playerIds.indexOf(0);

        if (zeroIndex >= 0) {
            const newPlayerIds = this.node.playerIds;
            newPlayerIds.splice(zeroIndex, 1);
            this.node.playerIds = newPlayerIds;
        }
        if (playerIdIndex < 0) {
            const newPlayerIds = this.node.playerIds;
            newPlayerIds.push(playerId);
            this.node.playerIds = newPlayerIds;
        }
            
        console.log('show now');
        console.log(this.node.playerIds);
    }

    hideFor(playerId) {

        console.log('hide was');
        console.log(this.node.playerIds);
        const playerIdIndex = this.node.playerIds.indexOf(playerId);
        if (playerIdIndex >= 0) {
            let newPlayerIds = this.node.playerIds;
            newPlayerIds.splice(playerIdIndex, 1);
            if (newPlayerIds.length == 0) {
                newPlayerIds = [0];
            }
            this.node.playerIds = newPlayerIds;
        }

        console.log('hide now');
        console.log(this.node.playerIds);
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


    clone() {
        throw new Error("Clone not implemented");
    }
}

class Shape extends BaseNode {
    constructor({ color, onClick, shapeType, coordinates2d, border, fill, playerIds, effects, input, node, id }) {
        if ((!coordinates2d || !shapeType) && !(node)) {
            throw new Error("Shape requires coordinates2d and shapeType");
        } 

        super({
            color,
            onClick,
            coordinates2d,
            border,
            fill,
            playerIds,
            effects,
            input,
            node,
            subtype: shapeTypeToSubtype[shapeType],
            id
        });
    }

    clone({ handleClick, input, id }) {
        const _id = id || null;//this.node.id;
        return new Shape({
            color: this.node.color,
            onClick: handleClick,
            shapeType: subtypeToShapeType[this.node.subType],
            coordinates2d: this.node.coordinates2d,
            border: this.node.border,
            fill: this.node.fill,
            playerIds: this.node.playerIds,
            effects: this.node.effects,
            input,
            id: _id
        });
            
    }

}

class Text extends BaseNode {
    constructor({ textInfo, playerIds, input, node}) {
        if (!textInfo && !node) {
            throw new Error("Text node requires textInfo");
        }

        super({
            textInfo,
            playerIds,
            input,
            node,
            subtype: SUBTYPES.TEXT
        });
    }
}

class Asset extends BaseNode {
    constructor({ assetInfo, onClick, coordinates2d, playerIds, effects, node }) {
        if (!assetInfo && !node) {
            throw new Error("Asset node requires assetInfo");
        }

        super({
            assetInfo,
            onClick,
            coordinates2d,
            playerIds,
            effects,
            node,
            subtype: SUBTYPES.ASSET
        });
    }

}

const GameNode = {
    Asset,
    Shape,
    Text
};

// todo: fix this hack
module.exports = {gameNode, GameNode};
