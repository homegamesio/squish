const SUBTYPE_TYPE = 55;

const squishSubType = {
	type: SUBTYPE_TYPE,
	squish: (a) => {
		return [a];
	},
	unsquish: (s) => {
		return s[0];
	}
}

module.exports = {
    SUBTYPE_TYPE,
    squishSubType
};