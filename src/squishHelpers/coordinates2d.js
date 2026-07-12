const { getFractional } = require('../util');
const subtypes = require('../subtypes');

const COORDINATES_2D_SUBTYPE = 52;

// The wire format packs each coordinate's integer part into a single unsigned
// byte, so any value outside [0, 255] wraps on transport — e.g. a vertex at
// -1.4 floors to -2, which becomes byte 254 and unsquishes to ~254.6. For a
// shape with some on-screen vertices that turns the whole polygon into a
// screen-spanning smear. Coordinates are only meaningful inside the 0–100
// plane; clamp to the byte-safe range so off-plane geometry pins near the edge
// instead of exploding. Values 100–255 are preserved so content can still slide
// off the right/bottom edge cleanly.
const BYTE_MAX = 255;
const clampCoord = (v) => (v < 0 ? 0 : (v > BYTE_MAX ? BYTE_MAX : v));

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
				// Math.floor on the integer byte is required, not decorative:
				// a raw float here only decoded correctly because Node's
				// Buffer truncated it on send. Consumers that don't go through
				// Buffer (e.g. the in-browser LocalSession) would round.
				const shiftedCenterX = clampCoord(squishHelper(scale.x, originalCoords[0]))
				squished[0] = Math.floor(shiftedCenterX);
				squished[1] = getFractional(shiftedCenterX);

				const shiftedCenterY = clampCoord(squishHelper(scale.y, originalCoords[1]))
				squished[2] = Math.floor(shiftedCenterY);
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
				const centerX = clampCoord(originalCoords[0]);
				squished[0] =  Math.floor(centerX);
				squished[1] = getFractional(centerX);

				const centerY = clampCoord(originalCoords[1]);
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

					const shifted = clampCoord(scaled + (removedSpace / 2));

					squished[2 * i] = Math.floor(shifted);
					squished[(2 * i) + 1] = getFractional(shifted);

				} else {
					const coord = clampCoord(originalCoords[i]);
					squished[2 * i] = Math.floor(coord);
					squished[(2 * i) + 1] = Math.round(100 * (coord - Math.floor(coord)));
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