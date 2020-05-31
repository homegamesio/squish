const InternalGameNode = require("./InternalGameNode");
const Colors = require('./Colors');

const assert = require('assert');

const ASSET_TYPE = 1;

const COLOR_SUBTYPE = 42;
const ID_SUBTYPE = 43;
const PLAYER_ID_SUBTYPE = 44;
const POS_SUBTYPE = 45;
const SIZE_SUBTYPE = 46;
const TEXT_SUBTYPE = 47;
const ASSET_SUBTYPE = 48;
const EFFECTS_SUBTYPE = 49;
const ONCLICK_SUBTYPE = 50;
const INPUT_SUBTYPE = 51;
const COORDINATES_2D_SUBTYPE = 52;
const FILL_SUBTYPE = 53;
const BORDER_SUBTYPE = 54;

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
    coordinates2d: {
        type: COORDINATES_2D_SUBTYPE,
        squish: (p) => {
            return p.flat();
        },
        unsquish: (squished) => {
            const unsquished = new Array(squished.length / 2);
            for (let i = 0; i < squished.length / 2; i ++) {
                unsquished[i] = [squished[2 * i], squished[(2 * i) + 1]];
            }
            return unsquished;
        }
    },
    fill: {
        type: FILL_SUBTYPE,
        squish: (c) => {
            return [c[0], c[1], c[2], c[3]];
        },
        unsquish: (squished) => {
            return [squished[0], squished[1], squished[2], squished[3]];
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
            const squishedText = new Array(t.text.length + 10);
            squishedText[0] = Math.floor(t.x);
            squishedText[1] = Math.round(100 * (t.x - Math.floor(t.x)));

            squishedText[2] = Math.floor(t.y);
            squishedText[3] = Math.round(100 * (t.y - Math.floor(t.y)));
            
            const textSize = t.size || 12;
            squishedText[4] = Math.floor(textSize);
            squishedText[5] = Math.round(100 * (textSize - Math.floor(textSize)));

            const textColor = t.color || Colors.BLACK;
            const squishedTextColor = squishSpec.color.squish(textColor);

            for (let i = 0; i < squishedTextColor.length; i++) {
                squishedText[6 + i] = squishedTextColor[i];
            }

            for (let i = 0; i < t.text.length; i++) {
                squishedText[10 + i] = t.text.charCodeAt(i);
            }
            
            return squishedText;
        }, 
        unsquish: (squished) => {
            const textPosX = squished[0] + squished[1] / 100;
            const textPosY = squished[2] + squished[3] / 100;
            const textSize = squished[4] + squished[5] / 100;
            const textColor = squished.slice(6, 10);

            const text = String.fromCharCode.apply(null, squished.slice(10));

            return {
                x: textPosX,
                y: textPosY,
                text: text,
                size: textSize,
                color: textColor
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
    },
    effects: {
        type: EFFECTS_SUBTYPE,
        squish: (a) => {
            if (a['shadow']) {
                const assetKey = 'shadow';
                let squishedLength = assetKey.length + 4; // + 4 for color
                if (a['shadow'].blur) {
                    squishedLength += 2;
                }
                const squishedEffects = new Array(squishedLength);
                for (let i = 0; i < assetKey.length; i++) {
                    squishedEffects[i] = assetKey.charCodeAt(i);
                }
                squishedEffects[assetKey.length] = a.shadow.color[0];
                squishedEffects[assetKey.length + 1] = a.shadow.color[1];
                squishedEffects[assetKey.length + 2] = a.shadow.color[2];
                squishedEffects[assetKey.length + 3] = a.shadow.color[3];

                if (a.shadow.blur) {
                    squishedEffects[assetKey.length + 4] = Math.floor(a.shadow.blur / 10)
                    squishedEffects[assetKey.length + 5] = a.shadow.blur % 10
                }

                return squishedEffects;
            }
        },
        unsquish: (squished) => {
            // 'shadow' is all (for now)
            const assetKey = String.fromCharCode.apply(null, squished.slice(0, 6));
            const color = squished.slice(6, 10);
            let blur;
            if (squished.length > 10) {
                blur = squished[10] * 10 + squished[11];
            }

            const unsquished = {
                [assetKey]: {
                    color
                }
            };

            if (blur) {
                unsquished[assetKey].blur = blur;
            }

            return unsquished;
        }
    },
    handleClick: {
        type: ONCLICK_SUBTYPE,
        squish: (a) => {
            return a ? [1] : [0];
        },
        unsquish: (a) => {
            return a[0] === 1;
        }
    },
    border: {
        type: BORDER_SUBTYPE,
        squish: (a) => {
            return [a];
        },
        unsquish: (s) => {
            return s[0];
        }
    },
    input: {
        type: INPUT_SUBTYPE,
        squish: (a) => {
            const squished = new Array(a.type.length);
            for (let i = 0; i < a.type.length; i++) {
                squished[i] = a.type.charCodeAt(i);
            }
            return squished;
        },
        unsquish: (squished) => {
            return {
                type: String.fromCharCode.apply(null, squished)
            }
        }
    }
};

const squishSpecKeys = [
    'id', 
    'color', 
    'playerId', 
    'coordinates2d',
    'fill',
    'pos', 
    'size', 
    'text', 
    'asset',
    'effects',
    'border',
    'handleClick',
    'input'
];

const typeToSquishMap = {};

for (const key in squishSpec) {
    typeToSquishMap[Number(squishSpec[key]['type'])] = key;
}

const unsquish = (squished) => {
        assert(squished[0] == 3);
    
        assert(squished.length === squished[1]);

        let squishedIndex = 2;

        let constructedGameNode = new InternalGameNode();

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
                if (attr !== undefined && attr !== null) {
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
