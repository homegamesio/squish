const ID_SUBTYPE = 43;

const squishId = {
	type: ID_SUBTYPE,
	squish: (i) => {
		return [i];
	},
	unsquish: (arr) => {
		return arr[0];
	}
}

module.exports = {
    ID_SUBTYPE,
    squishId
};