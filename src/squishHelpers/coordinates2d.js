const { getFractional } = require('../util');
const subtypes = require('../subtypes');

const COORDINATES_2D_SUBTYPE = 52;

const squishHelper = (scale, coord) => {
	const scaledCenter = scale * coord;
	const removedSpaceCenter = Math.round(100 * (1 - scale));
	return scaledCenter + (removedSpaceCenter / 2);
}

const squishCoordinates2d = {
	type: COORDINATES_2D_SUBTYPE,
	squish: (p, scale, node) => {
		const originalCoords = p.flat();
		const squished = new Array(originalCoords.length * 2);

		if (node.subType == subtypes.SHAPE_2D_CIRCLE) {
			if (scale) {
				const shiftedCenterX = squishHelper(scale.x, originalCoords[0])
				squished[0] = shiftedCenterX;
				squished[1] = getFractional(shiftedCenterX);

				const shiftedCenterY = squishHelper(scale.y, originalCoords[1])
				squished[2] = shiftedCenterY;
				squished[3] = getFractional(shiftedCenterY);

				let diagonal;
				if (scale.x === scale.y) {
					diagonal = scale.x * originalCoords[2];
				} else {
					// probably broken
					diagonal = Math.sqrt( Math.pow(100 * scale.x, 2) + Math.pow(100 * scale.y, 2)) * (originalCoords[2] / 100);
				}

				squished[4] = Math.floor(diagonal);
				squished[5] = getFractional(diagonal);
			} else {
				const centerX = originalCoords[0];
				squished[0] =  Math.floor(centerX);
				squished[1] = getFractional(centerX);

				const centerY = originalCoords[1];
				squished[2] = Math.floor(centerY);
				squished[3] = getFractional(centerY);

				const radius = originalCoords[2];
				squished[4] = Math.round(radius);
				squished[5] = getFractional(radius);
			}
		} else {
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
		}

		return squished;
	},
	dependsOn: ['subType'],
	unsquish: (squished, { subType }) => {
		const unsquished = new Array(squished.length / 2);
		for (let i = 0; i < squished.length; i += 2) {
			const value = squished[i] + (squished[i + 1] / 100);
			unsquished[i / 2] = value;
		}

		if (subType === subtypes.SHAPE_2D_POLYGON || subType === subtypes.SHAPE_2D_LINE) {
			const coordPairs = new Array(unsquished.length / 2);
			for (let i = 0; i < unsquished.length; i += 2) {
				coordPairs[i / 2] = [unsquished[i], unsquished[i + 1]];
			}

			return coordPairs;
		}

		return unsquished;
	}
}

module.exports = {
    COORDINATES_2D_SUBTYPE,
    squishCoordinates2d
};