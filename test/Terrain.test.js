const { terrainGenerator } = require("../src/terrain");
const assert = require("assert");

const outputTerrainMap = (board) => {
	let rtnString = '';
	board.forEach(row => {
		row.forEach(column => {
			if (column.filled) {
				rtnString += 'X';
			} else {
				rtnString += '_';
			}
		});
		rtnString += '\n';
	});
	// console.log(rtnString);
};

const hasTerrain = (board) => {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[i].length; j++) {
			if (board[i][j].filled) {
				return true;
			}
		}
	}
	return false;
};

test("No arg Terrain Test", () => {
	const board = terrainGenerator();
	outputTerrainMap(board);
	assert.ok(hasTerrain(board));
});

test("different board bounds Terrain Test", () => {
	const board = terrainGenerator({ x: 50, y: 50 });
	outputTerrainMap(board);
	assert.ok(hasTerrain(board));
});

test("different terrain bounds Terrain Test", () => {
	const board = terrainGenerator({ x: 100, y: 100 }, { x: 2, y: 2 });
	outputTerrainMap(board);
	assert.ok(hasTerrain(board));
});

test("different board & terrain bounds Terrain Test", () => {
	const board = terrainGenerator({ x: 50, y: 50 }, { x: 2, y: 2 });
	outputTerrainMap(board);
	assert.ok(hasTerrain(board));
});

test("different # of terrain Terrain Test", () => {
	const board = terrainGenerator({ x: 100, y: 100 }, { x: 5, y: 5 }, 10);
	outputTerrainMap(board);
	assert.ok(hasTerrain(board));
});

test("different all args Terrain Test", () => {
	const board = terrainGenerator({ x: 50, y: 50 }, { x: 2, y: 2 }, 10);
	outputTerrainMap(board);
	assert.ok(hasTerrain(board));
});
