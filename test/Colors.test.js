const { COLORS, randomColor } = require("../src/Colors");
const assert = require("assert");

test("Colors Test", () => {
	const color = randomColor();
	color.forEach(elem => {
		assert.equal(typeof elem, "number");
	});
});

test("should return the same color three times", () => {
	const exclusionList = [];
	Object.keys(COLORS).forEach(key => {
		if (key !== "AQUA") {
			exclusionList.push(key);
		}
	});

	let color = randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);

	color = randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);

	color = randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);
});

test("should return white", () => {
	// probability of this happening naturally is (1/n)^3
	// where n is the number of colors
	const exclusionList = [];
	Object.keys(COLORS).forEach(key => {
		exclusionList.push(key);
	});
	let color = randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);

	color = randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);

	color = randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);
});