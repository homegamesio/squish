const InternalGameNode = require("./InternalGameNode");
const { CONSTRUCTOR_TO_TYPE, TYPE_TO_CONSTRUCTOR } = require('./node-types');
const SUBTYPE_MAPPINGS = require('./subtype-mappings');

const { squishId } = require('./squishHelpers/id');
const { squishColor } = require('./squishHelpers/color');
const { squishPlayerIds } = require('./squishHelpers/playerIds');
const { squishPos } = require('./squishHelpers/pos');
const { squishFill } = require('./squishHelpers/fill');
const { squishSize } = require('./squishHelpers/size');
const { squishHandleClick } = require('./squishHelpers/handleClick');
const { squishBorder } = require('./squishHelpers/border');
const { squishSubType } = require('./squishHelpers/subType');
const { squishInput } = require('./squishHelpers/input');
const { squishCoordinates2d } = require('./squishHelpers/coordinates2d');
const { squishEffect } = require('./squishHelpers/effect');
const { squishText } = require('./squishHelpers/text');
const { squishAsset } = require('./squishHelpers/asset');

const squishSpec = {
    id: squishId,
    color: squishColor,
    playerIds: squishPlayerIds,
    pos: squishPos,
    coordinates2d: squishCoordinates2d,
    fill: squishFill,
    size: squishSize,
    text: squishText,
    asset: squishAsset,
    effects: squishEffect,
    handleClick:squishHandleClick,
    border: squishBorder,
    subType: squishSubType,
    input: squishInput
};

const typeToSquishMap = {};

for (const key in squishSpec) {
    typeToSquishMap[Number(squishSpec[key]['type'])] = key;
}

const unsquish = (squished) => {
    if (squished[0] != 3) {
        throw new Error('Squished[0] isnt 3.');
    }

    if (squished.length !== squished[1] + squished[2] + squished[3]) {
        throw new Error('Bad length value');
    }

    let squishedIndex = 5;

    let constructedInternalNode = new InternalGameNode();

    while(squishedIndex < squished.length) {

        const subFrameType = squished[squishedIndex];
        const subFrameLength = squished[squishedIndex + 1];
        const subFrame = squished.slice(squishedIndex + 2, squishedIndex + subFrameLength);

        if (!typeToSquishMap[subFrameType]) {
            console.warn("Unknown sub frame type " + subFrameType);
            break;
        } else {
            const objField = typeToSquishMap[subFrameType];
            const unsquishFun = squishSpec[objField]['unsquish'];
            // anything that was declared as a dependency of this property will be available when
            // calling this property's unsquish function
            const dependencyReference = Object.assign({}, constructedInternalNode);
            const unsquishedVal = unsquishFun(subFrame, dependencyReference);
            constructedInternalNode[objField] = unsquishedVal;
        }
        squishedIndex += subFrameLength;
    }

    const constructor = TYPE_TO_CONSTRUCTOR[squished[4]];

    if (constructor) {
        return new constructor({ node: constructedInternalNode });
    } 

    return {
        node: constructedInternalNode
    }
}

// When squishing, we need to make sure that properties that other properties depend on are inserted first.
// This is because when unsquishing, we need to guarantee that the dependee is available to the function responsible
// for creating the dependant
const sortSpecKeys = () => {
    const keysWithDeps = Object.keys(squishSpec).filter(key => {
        return squishSpec[key].dependsOn && squishSpec[key].dependsOn.length > 0;
    });

    const keysWithoutDeps = Object.keys(squishSpec).filter(key => {
        return !squishSpec[key].dependsOn || squishSpec[key].dependsOn.length === 0;
    });

    // todo: recursively find circular deps

    return [keysWithoutDeps, keysWithDeps].flat();
}

const squish = (entity, scale = null) => {
    let squishedPieces = [];

    const internalNode = entity.node;

    const sortedSpecKeys = sortSpecKeys();

    for (const keyIndex in sortedSpecKeys) {
        const key = sortedSpecKeys[keyIndex];
        if (key in internalNode) {
            const attr = internalNode[key];
            if (attr !== undefined && attr !== null) {
                const squished = squishSpec[key].squish(attr, scale, internalNode);
                squishedPieces.push([squishSpec[key]['type'], squished.length + 2, ...squished]);
            }
        }
    }

    let nodeClassCode = CONSTRUCTOR_TO_TYPE[entity.constructor.name];

    // implemented for json support (infer from subtype instead of custom json property)
    if (!nodeClassCode) {
        nodeClassCode = CONSTRUCTOR_TO_TYPE[SUBTYPE_MAPPINGS[internalNode.subType]];
    }

    const squished = squishedPieces.flat();

    // length + 5 bytes for what we're inserting here - 3 for length, one for type (3), one for class code
    const totalLength = squished.length + 5;
    const rightMost = Math.min(255, totalLength);
    const middle = Math.min(255, Math.max(0, totalLength - 255));
    const leftMost = Math.min(255, Math.max(0, totalLength - 510));

    return [3, leftMost, middle, rightMost, nodeClassCode, ...squished];

}

module.exports = {
    squish,
    unsquish
};
