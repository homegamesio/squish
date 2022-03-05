const ONCLICK_SUBTYPE = 50;

const squishHandleClick = {
	type: ONCLICK_SUBTYPE,
	squish: (a) => {
		return a ? [1] : [0];
	},
	unsquish: (a) => {
		return a[0] === 1;
	}
}

module.exports = {
    ONCLICK_SUBTYPE,
    squishHandleClick
};