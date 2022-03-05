const POS_SUBTYPE = 45;

const squishHelper = (position) => {
	return Math.round(100 * (position - Math.floor(position)))
}

const squishPos = {
	type: POS_SUBTYPE,
	squish: (p) => {
		return [Math.floor(p.x), squishHelper(p.x), Math.floor(p.y), squishHelper(p.y)]
	},
	unsquish: (squished) => {
		return {
			x: squished[0] + squished[1] / 100,
			y: squished[2] + squished[3] / 100
		}
	}
}

module.exports = {
    POS_SUBTYPE,
    squishPos
};