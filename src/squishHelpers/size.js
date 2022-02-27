const SIZE_SUBTYPE = 46;

const squishHelper = (size) => {
	Math.round(100 * (size- Math.floor(size)))
}

const squishSize = {
	type: SIZE_SUBTYPE,
	squish: (s) => {
		return [Math.floor(s.x), squishHelper(s.x), Math.floor(s.y), squishHelper(s.y)]
	},
	unsquish: (squished) => {
		return {
			x: squished[0] + squished[1] / 100,
			y: squished[2] + squished[3] / 100
		}
	}
}

module.exports = {
    SIZE_SUBTYPE,
    squishSize
};