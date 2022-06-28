const ID_SUBTYPE = 43;

const squishId = {
	type: ID_SUBTYPE,
	squish: (i) => {
		// max val: 10 000 000 000 000 000 (ten quadrillion)
		const idStr = i.toString();
		let strChunks = [];
		if (idStr.length > 2) {
			let j;
			for (j = 0; j + 2 <= idStr.length; j += 2) {
				strChunks.push(idStr.substring(j, j + 2));
			}

			if (j == idStr.length - 1) {
				strChunks.push(idStr.substring(j, j + 2));
			}
		} else {
			if (idStr.length === 1) {
				strChunks.push('0' + idStr);
			} else {
				strChunks.push(idStr);
			}
		}

		if (strChunks.length < 8) {
			while (strChunks.length < 8) {
				strChunks = ["00", ...strChunks];
			}
		}

		return strChunks.map(c => new Number(c));
	},
	unsquish: (arr) => {
		// build up from right to left then parse
		let str = '';
		for (let i = arr.length - 1; i >= 0; i--) {
			const val = arr[i] > 9 ? arr[i] : '0' + arr[i];
			str = val + str
		}

		return new Number(str);
	}
}

module.exports = {
    ID_SUBTYPE,
    squishId
};
