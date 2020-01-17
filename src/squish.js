const gameNode = require("./GameNode");
const assert = require('assert');

const ASSET_TYPE = 1;

const COLOR_SUBTYPE = 42;
const ID_SUBTYPE = 43;
const PLAYER_ID_SUBTYPE = 44;
const POS_SUBTYPE = 45;
const SIZE_SUBTYPE = 46;
const TEXT_SUBTYPE = 47;
const ASSET_SUBTYPE = 48;

const squishSpec = {
    id: {
        type: ID_SUBTYPE,
        squish: (i) => {
            return [i];
        },
        unsquish: (arr) => {
            return arr[0];
        }
    },
    color: {
        type: COLOR_SUBTYPE,
        squish: (c) => {
            return [c[0], c[1], c[2], c[3]];
        },
        unsquish: (squished) => {
            return [squished[0], squished[1], squished[2], squished[3]];
        }
    },
    playerId: {
        type: PLAYER_ID_SUBTYPE,
        squish: (i) => {
            return [i];
        }, 
        unsquish: (squished) => {
            return squished[0];
        }
    }, 
    pos: {
        type: POS_SUBTYPE,
        squish: (p) => {
            return [Math.floor(p.x), Math.round(100 * (p.x - Math.floor(p.x))), Math.floor(p.y), Math.round(100 * (p.y - Math.floor(p.y)))] 
        },
        unsquish: (squished) => {
            return {
                x: squished[0] + squished[1] / 100,
                y: squished[2] + squished[3] / 100
            }
        }
    },
    size: {
        type: SIZE_SUBTYPE,
        squish: (s) => {
            return [Math.floor(s.x), Math.round(100 * (s.x - Math.floor(s.x))), Math.floor(s.y), Math.round(100 * (s.y - Math.floor(s.y)))] 
        },
        unsquish: (squished) => {
            return {
                x: squished[0] + squished[1] / 100,
                y: squished[2] + squished[3] / 100
            }
        }
    }, 
    text: {
        type: TEXT_SUBTYPE,
        squish: (t) => {
            const squishedText = new Array(t.text.length + 6);
            squishedText[0] = Math.floor(t.x);
            squishedText[1] = Math.round(100 * (t.x - Math.floor(t.x)));

            squishedText[2] = Math.floor(t.y);
            squishedText[3] = Math.round(100 * (t.y - Math.floor(t.y)));
            
            const textSize = t.size || 12;
            squishedText[4] = Math.floor(textSize);
            squishedText[5] = Math.round(100 * (textSize - Math.floor(textSize)));

            for (let i = 0; i < t.text.length; i++) {
                squishedText[6 + i] = t.text.charCodeAt(i);
            }

            return squishedText;
        }, 
        unsquish: (squished) => {
            const textPosX = squished[0] + squished[1] / 100;
            const textPosY = squished[2] + squished[3] / 100;
            const textSize = squished[4] + squished[5] / 100;

            const text = String.fromCharCode.apply(null, squished.slice(6));

            return {
                x: textPosX,
                y: textPosY,
                text: text,
                size: textSize
            };
        }
    },
    asset: {
        type: ASSET_SUBTYPE,
        squish: (a) => {
            const assetKey = Object.keys(a)[0];
            const squishedAssets = new Array(8 + assetKey.length);
            
            squishedAssets[0] = Math.floor(a[assetKey].pos.x);
            squishedAssets[1] = Math.round(100 * (a[assetKey].pos.x - Math.floor(a[assetKey].pos.x)));

            squishedAssets[2] = Math.floor(a[assetKey].pos.y);
            squishedAssets[3] = Math.round(100 * (a[assetKey].pos.y - Math.floor(a[assetKey].pos.y)));

            squishedAssets[4] = Math.floor(a[assetKey].size.x);
            squishedAssets[5] = Math.round(100 * (a[assetKey].size.x - Math.floor(a[assetKey].size.x)));

            squishedAssets[6] = Math.floor(a[assetKey].size.y);
            squishedAssets[7] = Math.round(100 * (a[assetKey].size.y - Math.floor(a[assetKey].size.y)));

            for (let i = 0; i < assetKey.length; i++) {
                squishedAssets[8 + i] = assetKey.charCodeAt(i);
            }
            
            return squishedAssets;
        }, 
        unsquish: (squished) => {
            const assetPosX = squished[0] + squished[1] / 100;
            const assetPosY = squished[2] + squished[3] / 100;

            const assetSizeX = squished[4] + squished[5] / 100;
            const assetSizeY = squished[6] + squished[7] / 100;

            const assetKey = String.fromCharCode.apply(null, squished.slice(8));
            return {
                [assetKey]: {
                    pos: {
                        x: assetPosX,
                        y: assetPosY
                    },
                    size: {
                        x: assetSizeX,
                        y: assetSizeY
                    }
                }
            }
        }
    }
};

const squishSpecKeys = [
    'id', 
    'color', 
    'playerId', 
    'pos', 
    'size', 
    'text', 
    'asset' 
];

const typeToSquishMap = {};

for (const key in squishSpec) {
    typeToSquishMap[Number(squishSpec[key]['type'])] = key;
}

const unsquish = (squished) => {
        assert(squished[0] == 3);
    
        assert(squished.length === squished[1]);

        let squishedIndex = 2;

        let constructedGameNode = gameNode();

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
                const unsquishedVal = unsquishFun(subFrame);
                constructedGameNode[objField] = unsquishedVal;
            }
            squishedIndex += subFrameLength;
        }
        
        return constructedGameNode;
    }

const squish = (entity) => {
        let squishedPieces = [];

        for (const keyIndex in squishSpecKeys) {
            const key = squishSpecKeys[keyIndex];
            if (key in entity) {
                const attr = entity[key];
                if (attr) {
                    const squished = squishSpec[key].squish(attr);
                    squishedPieces.push([squishSpec[key]['type'], squished.length + 2, ...squished]);
                }
            } 
        }

        const squished = squishedPieces.flat();
        return [3, squished.length + 2, ...squished];

}

module.exports = {
    squish,
    unsquish
};
