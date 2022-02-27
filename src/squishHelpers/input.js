const INPUT_SUBTYPE = 51;

const squishInput = {
	type: INPUT_SUBTYPE,
	squish: (a) => {
		const squished = new Array(a.type.length);
		for (let i = 0; i < a.type.length; i++) {
			squished[i] = a.type.codePointAt(i);
		}
		return squished;
	},
	unsquish: (squished) => {
		return {
			type: String.fromCodePoint.apply(null, squished)
		}
	}
}

module.exports = {
    INPUT_SUBTYPE,
    squishInput
};