const ID_SUBTYPE = 43;

const squishId = {
	type: ID_SUBTYPE,
	squish: (i) => {
		// max val: 10 000 000 000 000 000 (ten quadrillion)
		const idStr = i.toString();
                let thing = new Array(12);
                let curI = 0;
                for (curI; curI <= (12 - idStr.length); curI++) {
                    thing[curI] = 0;
                }

                for (let i = 0; i < idStr.length; i++) {
    	    	    let strChunks = [];
                        thing[i + curI] = Number(idStr.charAt(i));
                }
                return thing;
	},
	unsquish: (arr) => {
                let total = 0;
                for (let i = 0; i < arr.length; i++) {
                    total += arr[i] * (Math.pow(10, arr.length - i - 1));
                }
                return Number(total);
	}
}

module.exports = {
    ID_SUBTYPE,
    squishId
};
