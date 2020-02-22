const COLORS = require("../src/Colors");
const assert = require("assert");

test("Colors Test", () => {
	const color = COLORS.randomColor();
	color.forEach(elem => {
		assert.equal(typeof elem, "number");
	});
});

test("should return the same color three", () => {
	const exclusionList = [];
	Object.keys(COLORS).forEach(key => {
		if (key !== "AQUA" && key !== "randomColor") {
			exclusionList.push(COLORS[key]);
		}
	});

	let color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);

	color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);

	color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);
});

test("should return white", () => {
	// probability of this happening naturally is (1/27)^3
	const exclusionList = [];
	Object.keys(COLORS).forEach(key => {
		if (key !== "randomColor") {
			exclusionList.push(COLORS[key]);
		}
	});
	let color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);

	color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);

	color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);
});