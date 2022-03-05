const Shapes = require('./Shapes');
const SUBTYPES = require('./subtypes');
const { gameNode, BaseNode } = require('./BaseNode');

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
        const _id = id || null;
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
    constructor({ textInfo, playerIds, input, node, id }) {
        if (!textInfo && !node) {
            throw new Error("Text node requires textInfo");
        }

        super({
            textInfo,
            playerIds,
            input,
            node,
            subtype: SUBTYPES.TEXT,
            id
        });
    }

    clone({ handleClick, input, id }) {
        const _id = id || null;

        return new Text({
            textInfo: Object.assign({}, this.node.text),
            playerIds: this.playerIds?.slice(),
            id: _id
        });
    }
}

class Asset extends BaseNode {
    constructor({ assetInfo, onClick, coordinates2d, playerIds, effects, node, id }) {
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
            subtype: SUBTYPES.ASSET,
            id
        });
    }

    clone({ handleClick, input, id }) {
        const _id = id || null;

        return new Asset({
            assetInfo: Object.assign({}, this.node.asset),
            playerIds: this.playerIds?.slice(),
            id: _id
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
