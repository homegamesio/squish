const InternalGameNode = require("./InternalGameNode");
const Colors = require('./Colors');
const Shapes = require('./Shapes');

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
const TYPE_SUBTYPE = 55;

const { getFractional, hypLength } = require('./util/');

const squishSpec = {
    type: {
        type: TYPE_SUBTYPE,
        squish: (t) => {
            return [t];
        },
        unsquish: (squished) => {
            return squished[0];
        }
    },
    id: {
        type: ID_SUBTYPE,
        squish: (i) => {
            const numString = `${i}`;
            if (numString.length <= 2) {
                return [0, i];
            } else {
                if (numString.length == 3) {
                    return [Number(numString.charAt(0)), Number(numString.substring(1, 3))];
                } else if (numString.length == 4) {
                    return [Number(numString.substring(0, 2)), Number(numString.substring(2, 4))];
                }
            }
        },
        unsquish: (arr) => {
            if (arr[0] == 0) {
                return Number(arr[1]);
            } 

            let concatString;
            if (arr[1] < 10) {
                concatString = `${arr[0]}0${arr[1]}`;
            } else {
                concatString = `${arr[0]}${arr[1]}`; 
            }
            return Number(concatString);
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
    playerIds: {
        type: PLAYER_ID_SUBTYPE,
        squish: (i) => i,
        unsquish: (squished) => squished
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
        squish: (p, scale, { type }) => {
            const originalCoords = p.flat();
            const squished = new Array(originalCoords.length * 2);
            for (const i in originalCoords) {
                if (scale) {
                    const isX = i % 2 == 0;
                    const scaleValue = isX ? scale.x : scale.y;
                    const scaled = scaleValue * originalCoords[i];

                    const removedSpace = Math.round(100 * (1 - scaleValue));

                    const shifted = scaled + (removedSpace / 2);

                    squished[2 * i] = shifted;
                    squished[(2 * i) + 1] = getFractional(shifted);

                } else {
                    squished[2 * i] = Math.floor(originalCoords[i]);
                    squished[(2 * i) + 1] = Math.round(100 * (originalCoords[i] - Math.floor(originalCoords[i])));
                }
            }

            return squished;
        },
        unsquish: (squished) => {
            const unsquished = new Array(squished.length / 2);
            for (let i = 0; i < squished.length; i += 2) {
                const value = squished[i] + (squished[i + 1] / 100);
                unsquished[i / 2] = value;
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
        squish: (t, scale) => {
            const textX = scale ? (t.x * scale.x) + Math.round(100 * (1 - scale.x)) / 2 : t.x;
            const textY = scale ? (t.y * scale.y) + Math.round(100 * (1 - scale.y)) / 2 : t.y;

            const align = t.align || 'left';
            const squishedText = new Array(t.text.length + 10 + align.length);
            
            squishedText[0] = Math.floor(textX);
            squishedText[1] = Math.round(100 * (textX - Math.floor(textX)));

            squishedText[2] = Math.floor(textY);
            squishedText[3] = Math.round(100 * (textY - Math.floor(textY)));
            
            const textSize = t.size || 1;
            const scaledTextSize = scale ? textSize * hypLength(scale.x, scale.y) : textSize;

            squishedText[4] = Math.floor(scaledTextSize);
            squishedText[5] = Math.round(100 * (scaledTextSize - Math.floor(scaledTextSize)));

            const textColor = t.color || Colors.BLACK;
            const squishedTextColor = squishSpec.color.squish(textColor);

            for (let i = 0; i < squishedTextColor.length; i++) {
                squishedText[6 + i] = squishedTextColor[i];
            }

            squishedText[6 + squishedTextColor.length] = align.length;

            for (let i = 0; i < align.length; i++) {
                squishedText[6 + squishedTextColor.length + 1 + i] = align.codePointAt(i);
            }

            for (let i = 0; i < t.text.length; i++) {
                squishedText[6 + squishedTextColor.length + align.length + 1 + i] = t.text.codePointAt(i);
            }
            
            return squishedText;
        }, 
        unsquish: (squished) => {
            const textPosX = squished[0] + squished[1] / 100;
            const textPosY = squished[2] + squished[3] / 100;
            const textSize = squished[4] + squished[5] / 100;
            const textColor = squished.slice(6, 10);
            const textAlignLength = squished[10];
            const align = String.fromCodePoint.apply(null, squished.slice(11, 11 + textAlignLength));

            const text = String.fromCodePoint.apply(null, squished.slice(11 + textAlignLength));

            return {
                x: textPosX,
                y: textPosY,
                text: text,
                size: textSize,
                color: textColor,
                align
            };
        }
    },
    asset: {
        type: ASSET_SUBTYPE,
        squish: (a, scale) => {
            const assetKey = Object.keys(a)[0];
            const squishedAssets = new Array(8 + assetKey.length);

            const asset = a[assetKey];

            const posX = scale ? ((scale.x * asset.pos.x) + Math.round(100 * (1 - scale.x)) / 2) : asset.pos.x;
            const posY = scale ? ((scale.y * asset.pos.y) + Math.round(100 * (1 - scale.y)) / 2) : asset.pos.y;

            const sizeX = scale ? scale.x * asset.size.x : asset.size.x;
            const sizeY = scale ? scale.y * asset.size.y : asset.size.y;

            squishedAssets[0] = Math.floor(posX);
            squishedAssets[1] = getFractional(posX);

            squishedAssets[2] = Math.floor(posY);
            squishedAssets[3] = getFractional(posY);

            squishedAssets[4] = Math.floor(sizeX);
            squishedAssets[5] = getFractional(sizeX);

            squishedAssets[6] = Math.floor(sizeY);
            squishedAssets[7] = getFractional(sizeY);

            for (let i = 0; i < assetKey.length; i++) {
                squishedAssets[8 + i] = assetKey.codePointAt(i);
            }
            
            return squishedAssets;
        }, 
        unsquish: (squished) => {
            const assetPosX = squished[0] + squished[1] / 100;
            const assetPosY = squished[2] + squished[3] / 100;

            const assetSizeX = squished[4] + squished[5] / 100;
            const assetSizeY = squished[6] + squished[7] / 100;

            const assetKey = String.fromCodePoint.apply(null, squished.slice(8));
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
                    squishedEffects[i] = assetKey.codePointAt(i);
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
            const assetKey = String.fromCodePoint.apply(null, squished.slice(0, 6));
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
                squished[i] = a.type.codePointAt(i);
            }
            return squished;
        },
        unsquish: (squished) => {
            return {
                type: String.fromCodePoint.apply(null, squished)
            }
        }
    }
};

const squishSpecKeys = [
    'id', 
    'color', 
    'playerIds', 
    'coordinates2d',
    'fill',
    'pos', 
    'size', 
    'text', 
    'asset',
    'effects',
    'border',
    'handleClick',
    'input',
    'type'
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

const squish = (entity, scale = null) => {
    let squishedPieces = [];

    for (const keyIndex in squishSpecKeys) {
        const key = squishSpecKeys[keyIndex];
        if (key in entity) {
            const attr = entity[key];
            if (attr !== undefined && attr !== null) {
                const squished = squishSpec[key].squish(attr, scale, entity);
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
