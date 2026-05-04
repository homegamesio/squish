const { hypLength } = require('../util')
const Colors = require('../Colors');
const { squishColor } = require('./color')

const TEXT_SUBTYPE = 47;

// Encode a codepoint into 3 squished bytes directly into a target array.
// Avoids allocating the intermediate ting array and template strings
// that the original code created per character.
const encodeCodePoint = (target, offset, codePoint) => {
	const s = codePoint.toString();
	const len = s.length;
	let a = 0, b = 0, c = 0;
	if (len === 1) {
		c = codePoint;
	} else if (len === 2) {
		c = codePoint;
	} else if (len === 3) {
		b = Number(s[0]);
		c = Number(s[1] + s[2]);
	} else if (len === 4) {
		b = Number(s[0] + s[1]);
		c = Number(s[2] + s[3]);
	} else if (len === 5) {
		a = Number(s[0]);
		b = Number(s[1] + s[2]);
		c = Number(s[3] + s[4]);
	} else {
		a = Number(s[0] + s[1]);
		b = Number(s[2] + s[3]);
		c = Number(s[4] + s[5]);
	}
	target[offset] = a;
	target[offset + 1] = b;
	target[offset + 2] = c;
};

// Count codepoints in a string without allocating an array via [...str].
// Uses the string iterator protocol which handles surrogate pairs correctly.
const codePointLength = (str) => {
	let len = 0;
	for (const _ of str) len++;
	return len;
};

const squishText = {
	type: TEXT_SUBTYPE,
	squish: (t, scale) => {
		const textX = scale ? (t.x * scale.x) + Math.round(100 * (1 - scale.x)) / 2 : t.x;
		const textY = scale ? (t.y * scale.y) + Math.round(100 * (1 - scale.y)) / 2 : t.y;

		const align = t.align || 'left';
		const font = t.font || 'default';

		// Count codepoints without [...str] spread allocation
		const alignCPLen = codePointLength(align);
		const fontCPLen = codePointLength(font);
		const textCPLen = codePointLength(t.text);

		// 6 header bytes + 4 color + 2 length markers + 3 bytes per codepoint
		const totalLen = 12 + (alignCPLen + fontCPLen + textCPLen) * 3;
		const squishedText = new Array(totalLen);

		squishedText[0] = Math.floor(textX);
		squishedText[1] = Math.round(100 * (textX - Math.floor(textX)));

		squishedText[2] = Math.floor(textY);
		squishedText[3] = Math.round(100 * (textY - Math.floor(textY)));

		const textSize = t.size || 1;
		const scaledTextSize = scale ? textSize * hypLength(scale.x, scale.y) : textSize;

		squishedText[4] = Math.floor(scaledTextSize);
		squishedText[5] = Math.round(100 * (scaledTextSize - Math.floor(scaledTextSize)));

		const textColor = t.color || Colors.BLACK;
		squishedText[6] = textColor[0];
		squishedText[7] = textColor[1];
		squishedText[8] = textColor[2];
		squishedText[9] = textColor[3];

		squishedText[10] = 3 * alignCPLen;
		squishedText[11] = 3 * fontCPLen;

		let offset = 12;

		// Encode align string — iterate codepoints without spread
		for (const ch of align) {
			encodeCodePoint(squishedText, offset, ch.codePointAt(0));
			offset += 3;
		}

		// Encode font string
		for (const ch of font) {
			encodeCodePoint(squishedText, offset, ch.codePointAt(0));
			offset += 3;
		}

		// Encode text string
		for (const ch of t.text) {
			encodeCodePoint(squishedText, offset, ch.codePointAt(0));
			offset += 3;
		}

		return squishedText;
	},
	unsquish: (squished) => {
		const textPosX = squished[0] + squished[1] / 100;
		const textPosY = squished[2] + squished[3] / 100;
		const textSize = squished[4] + squished[5] / 100;
		const textColor = squished.slice(6, 10);
		const textAlignLength = squished[10];
                const textFontLength = squished[11];
		const textAlignVal = squished.slice(12, 12 + textAlignLength);
                const textFontVal = squished.slice(12 + textAlignLength, 12 + textAlignLength + textFontLength);
		const textVal = squished.slice(12 + textAlignLength + textFontLength);

		let alignCodePoints = [];
		for (let i = 0; i < textAlignVal.length; i+=3) {
			let firstChunk = textAlignVal[i].toString();
			if (firstChunk.length == 1) {
				firstChunk = `0${firstChunk}`;
			}

			let secondChunk = textAlignVal[i + 1].toString();
			if (secondChunk.length == 1) {
				secondChunk = `0${secondChunk}`;
			}

			let thirdChunk = textAlignVal[i + 2].toString();
			if (thirdChunk.length == 1) {
				thirdChunk = `0${thirdChunk}`;
			}

			const codePoint = firstChunk + secondChunk + thirdChunk;
			alignCodePoints.push(codePoint);
		}
		const align = String.fromCodePoint.apply(null, alignCodePoints);
	         
                let fontCodePoints = [];
		for (let i = 0; i < textFontVal.length; i+=3) {
			let firstChunk = textFontVal[i].toString();
			if (firstChunk.length == 1) {
				firstChunk = `0${firstChunk}`;
			}

			let secondChunk = textFontVal[i + 1].toString();
			if (secondChunk.length == 1) {
				secondChunk = `0${secondChunk}`;
			}

			let thirdChunk = textFontVal[i + 2].toString();
			if (thirdChunk.length == 1) {
				thirdChunk = `0${thirdChunk}`;
			}

			const codePoint = firstChunk + secondChunk + thirdChunk;
			fontCodePoints.push(codePoint);
		}
		const font = String.fromCodePoint.apply(null, fontCodePoints);

		const textCodePoints = [];
		for (let i = 0; i < textVal.length; i+=3) {
			let firstChunk = textVal[i].toString();
			if (firstChunk.length == 1) {
				firstChunk = `0${firstChunk}`;
			}
			let secondChunk = textVal[i + 1].toString();
			if (secondChunk.length == 1) {
				secondChunk = `0${secondChunk}`;
			}
			let thirdChunk = textVal[i + 2].toString();
			if (thirdChunk.length == 1) {
				thirdChunk = `0${thirdChunk}`;
			}

			const codePoint = firstChunk + secondChunk + thirdChunk;
			textCodePoints.push(codePoint);
		}

        	const text = String.fromCodePoint.apply(null, textCodePoints);

		return {
			x: textPosX,
			y: textPosY,
			text: text,
			size: textSize,
			color: textColor,
			align,
                        font
		};
	}
}

module.exports = {
    TEXT_SUBTYPE,
    squishText
};
