const COLORS = require("../src/Colors");
const assert = require("assert");

test("Colors Test", () => {
	const color = COLORS.randomColor();
	color.forEach(elem => {
		assert.equal(typeof elem, "number");
	});
});

test("should return the same color three", () => {
	const exclusionList = [
		COLORS.BLACK,
		COLORS.BLUE,
		COLORS.BRONZE,
		COLORS.BROWN,
		COLORS.CREAM,
		COLORS.EMERALD,
		COLORS.FUCHSIA,
		COLORS.GOLD,
		COLORS.GRAY,
		COLORS.GREEN,
		COLORS.LAVENDER,
		COLORS.MAGENTA,
		COLORS.MAROON,
		COLORS.MUSTARD,
		COLORS.ORANGE,
		COLORS.ORANGE_RED,
		COLORS.PERRYWINKLE,
		COLORS.PINK,
		COLORS.PURPLE,
		COLORS.RED,
		COLORS.SILVER,
		COLORS.TEAL,
		COLORS.TERRACOTTA,
		COLORS.TURQUOISE,
		COLORS.WHITE,
		COLORS.YELLOW,
	];
	let color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);

	color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);

	color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.AQUA, color);
});

test("should return white", () => {
	// probability of this happening naturally is (1/27)^3
	const exclusionList = [
		COLORS.AQUA,
		COLORS.BLACK,
		COLORS.BLUE,
		COLORS.BRONZE,
		COLORS.BROWN,
		COLORS.CREAM,
		COLORS.EMERALD,
		COLORS.FUCHSIA,
		COLORS.GOLD,
		COLORS.GRAY,
		COLORS.GREEN,
		COLORS.LAVENDER,
		COLORS.MAGENTA,
		COLORS.MAROON,
		COLORS.MUSTARD,
		COLORS.ORANGE,
		COLORS.ORANGE_RED,
		COLORS.PERRYWINKLE,
		COLORS.PINK,
		COLORS.PURPLE,
		COLORS.RED,
		COLORS.SILVER,
		COLORS.TEAL,
		COLORS.TERRACOTTA,
		COLORS.TURQUOISE,
		COLORS.WHITE,
		COLORS.YELLOW,
	];
	let color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);

	color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);

	color = COLORS.randomColor(exclusionList);
	assert.deepEqual(COLORS.WHITE, color);
});