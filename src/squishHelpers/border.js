const BORDER_SUBTYPE = 54;

const squishBorder = {
	type: BORDER_SUBTYPE,
	squish: (a) => {
		return [a];
	},
	unsquish: (s) => {
		return s[0];
	}
}

module.exports = {
    BORDER_SUBTYPE,
    squishBorder
};