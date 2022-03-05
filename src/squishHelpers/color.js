const COLOR_SUBTYPE = 42;

const squishColor = {
	type: COLOR_SUBTYPE,
	squish: (c) => {
		return [c[0], c[1], c[2], c[3]];
	},
	unsquish: (squished) => {
		return [squished[0], squished[1], squished[2], squished[3]];
	}
}

module.exports = {
    COLOR_SUBTYPE,
    squishColor
};