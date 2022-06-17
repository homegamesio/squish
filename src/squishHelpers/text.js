const { hypLength } = require('../util')
const Colors = require('../Colors');
const { squishColor } = require('./color')

const TEXT_SUBTYPE = 47;

const squishText = {
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
		const squishedTextColor = squishColor.squish(textColor);

		for (let i = 0; i < squishedTextColor.length; i++) {
			squishedText[6 + i] = squishedTextColor[i];
		}

		squishedText[6 + squishedTextColor.length] = 3 * [...align].length;

		let j = 0;
		for (let i = 0; i < [...align].length; i++) {
			const codePointToInsert = [...align][i].codePointAt(0);
			const codePointString = codePointToInsert.toString();
			let ting;
			if (codePointString.length == 1) {
				ting = [`00`, `00`, `0${codePointString}`];
			} else if (codePointString.length == 2) {
				ting = [`00`, `00`, `${codePointString}`];
			} else if (codePointString.length == 3) {
				ting = [`00`, `0${codePointString.charAt(0)}`, `${codePointString.charAt(1)}${codePointString.charAt(2)}`];
			} else if (codePointString.length == 4) {
				ting = [`00`, `${codePointString.charAt(0)}${codePointString.charAt(1)}`, `${codePointString.charAt(2)}${codePointString.charAt(3)}`];
			} else if (codePointString.length == 5) {
				ting = [`0${codePointString.charAt(0)}`, `${codePointString.charAt(1)}${codePointString.charAt(2)}`, `${codePointString.charAt(3)}${codePointString.charAt(4)}`];
			} else {
				ting = [`${codePointString.charAt(0)}${codePointString.charAt(1)}`, `${codePointString.charAt(2)}${codePointString.charAt(3)}`, `${codePointString.charAt(4)}${codePointString.charAt(5)}`];
			}
			squishedText[6 + squishedTextColor.length + 1 + j] = Number(ting[0]);
			squishedText[6 + squishedTextColor.length + 1 + j + 1] = Number(ting[1]);
			squishedText[6 + squishedTextColor.length + 1 + j + 2] = Number(ting[2]);
			j += 3;
		}

		let k = 0;
		for (let i = 0; i <  [...t.text].length; i++) {
			const codePointToInsert = [...t.text][i].codePointAt(0);
			const codePointString = codePointToInsert.toString();
			let ting;
			if (codePointString.length == 1) {
				ting = [`00`, `00`, `0${codePointString}`];
			} else if (codePointString.length == 2) {
				ting = [`00`, `00`, `${codePointString}`];
			} else if (codePointString.length == 3) {
				ting = [`00`, `0${codePointString.charAt(0)}`, `${codePointString.charAt(1)}${codePointString.charAt(2)}`];
			} else if (codePointString.length == 4) {
				ting = [`00`, `${codePointString.charAt(0)}${codePointString.charAt(1)}`, `${codePointString.charAt(2)}${codePointString.charAt(3)}`];
			} else if (codePointString.length == 5) {
				ting = [`0${codePointString.charAt(0)}`, `${codePointString.charAt(1)}${codePointString.charAt(2)}`, `${codePointString.charAt(3)}${codePointString.charAt(4)}`];
			} else {
				ting = [`${codePointString.charAt(0)}${codePointString.charAt(1)}`, `${codePointString.charAt(2)}${codePointString.charAt(3)}`, `${codePointString.charAt(4)}${codePointString.charAt(5)}`];
			}
			squishedText[6 + squishedTextColor.length + 1 + j + k] = Number(ting[0]);
			squishedText[6 + squishedTextColor.length + 1 + j + k + 1] = Number(ting[1]);
			squishedText[6 + squishedTextColor.length + 1 + j + k + 2] = Number(ting[2]);

			k += 3;
		}

		return squishedText;
	},
	unsquish: (squished) => {
		const textPosX = squished[0] + squished[1] / 100;
		const textPosY = squished[2] + squished[3] / 100;
		const textSize = squished[4] + squished[5] / 100;
		const textColor = squished.slice(6, 10);
		const textAlignLength = squished[10];
		const textAlignVal = squished.slice(11, 11 + textAlignLength);
		const textVal = squished.slice(11 + textAlignLength);

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

		const align = String.fromCodePoint.apply(null, alignCodePoints);
		const text = String.fromCodePoint.apply(null, textCodePoints);

		return {
			x: textPosX,
			y: textPosY,
			text: text,
			size: textSize,
			color: textColor,
			align
		};
	}
}

module.exports = {
    TEXT_SUBTYPE,
    squishText
};
