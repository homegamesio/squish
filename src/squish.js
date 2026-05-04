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
        const subFrameLength = squished[squishedIndex + 1] + squished[squishedIndex + 2];
        const subFrame = squished.slice(squishedIndex + 3, squishedIndex + subFrameLength);

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

// Cache the sorted keys — squishSpec never changes after module load.
// This eliminates 3 array allocations (filter, filter, flat) per squish() call.
let _cachedSortedKeys = null;
const sortSpecKeys = () => {
    if (_cachedSortedKeys) return _cachedSortedKeys;

    const keysWithDeps = Object.keys(squishSpec).filter(key => {
        return squishSpec[key].dependsOn && squishSpec[key].dependsOn.length > 0;
    });

    const keysWithoutDeps = Object.keys(squishSpec).filter(key => {
        return !squishSpec[key].dependsOn || squishSpec[key].dependsOn.length === 0;
    });

    // todo: recursively find circular deps

    _cachedSortedKeys = [keysWithoutDeps, keysWithDeps].flat();
    return _cachedSortedKeys;
}

const squish = (entity, scale = null) => {
    const internalNode = entity.node;
    const sortedSpecKeys = sortSpecKeys();

    // Build output directly into a flat array instead of nested arrays.
    // This eliminates: squishedPieces array, per-field wrapper arrays,
    // spread operators, and the final .flat() call.
    let buf = [];
    let bufLen = 0;

    // Reserve 5 bytes for the header (filled in at the end)
    bufLen = 5;

    for (let keyIndex = 0; keyIndex < sortedSpecKeys.length; keyIndex++) {
        const key = sortedSpecKeys[keyIndex];
        if (key in internalNode) {
            const attr = internalNode[key];
            if (attr !== undefined && attr !== null) {
                const squished = squishSpec[key].squish(attr, scale, internalNode);
                const subFrameLen = squished.length + 3;
                const rightMost = Math.min(255, subFrameLen);
                const leftMost = Math.min(255, Math.max(0, subFrameLen - 255));

                buf[bufLen++] = squishSpec[key]['type'];
                buf[bufLen++] = leftMost;
                buf[bufLen++] = rightMost;
                for (let si = 0; si < squished.length; si++) {
                    buf[bufLen++] = squished[si];
                }
            }
        }
    }

    let nodeClassCode = CONSTRUCTOR_TO_TYPE[entity.constructor.name];

    // implemented for json support (infer from subtype instead of custom json property)
    if (!nodeClassCode) {
        nodeClassCode = CONSTRUCTOR_TO_TYPE[SUBTYPE_MAPPINGS[internalNode.subType]];
    }

    // Fill in the header
    const totalLength = bufLen;
    buf[0] = 3;
    buf[1] = Math.min(255, Math.max(0, totalLength - 510));
    buf[2] = Math.min(255, Math.max(0, totalLength - 255));
    buf[3] = Math.min(255, totalLength);
    buf[4] = nodeClassCode;

    buf.length = bufLen;
    return buf;

}

module.exports = {
    squish,
    unsquish
};
