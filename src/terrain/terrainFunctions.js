const placeTerrain = (board, { x, y }, boardWidth, boardHeight, keyPoint) => {
    if (x < 0 || x >= boardWidth) {
        return;
    } else if (y < 0 || y >= boardHeight) {
        return;
    } else if ( x === keyPoint.x && y === keyPoint.y) {
        return;
    }

    if (!board[x][y].filled) {
        if (board[x][y].north) {
            board[x][y - 1].south = false;
        }
        if (board[x][y].south) {
            board[x][y + 1].north = false;
        }
        if (board[x][y].east) {
            board[x + 1][y].west = false;
        }
        if (board[x][y].west) {
            board[x - 1][y].east = false;
        }
        board[x][y].filled = true;
        board[x][y].north = false;
        board[x][y].south = false;
        board[x][y].east = false;
        board[x][y].west = false;
    }
}

const square = (board, { x, y }, boardWidth, boardHeight, keyPoint) => {
    const option = Math.floor(Math.random() * 4);
    placeTerrain(board, { x, y }, boardWidth, boardHeight, keyPoint);
    if (option === 0) {	// start point is top left
        placeTerrain(board, { x: x + 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x, y: y + 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 1, y: y + 1 }, boardWidth, boardHeight, keyPoint);
    } else if (option === 1) { // start point is top right
        placeTerrain(board, { x: x - 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x, y: y + 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y: y + 1 }, boardWidth, boardHeight, keyPoint);
    } else if (option === 2) { // start point is bottom left
        placeTerrain(board, { x, y: y - 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 1, y: y - 1 }, boardWidth, boardHeight, keyPoint);
    } else { // start point is bottom right
        placeTerrain(board, { x, y: y - 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y: y - 1 }, boardWidth, boardHeight, keyPoint);
    }
};

const line = (board, { x, y }, boardWidth, boardHeight, keyPoint) => {
    const option = Math.floor(Math.random() * 4);
    placeTerrain(board, { x, y }, boardWidth, boardHeight, keyPoint);
    if (option === 0) {	// start point is top
        placeTerrain(board, { x, y: y + 1}, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x, y: y + 2 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x, y: y + 3 }, boardWidth, boardHeight, keyPoint);
    } else if (option === 1) { // start point is left
        placeTerrain(board, { x: x + 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 2, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 3, y }, boardWidth, boardHeight, keyPoint);
    } else if (option === 2) { // start point is right
        placeTerrain(board, { x: x - 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 2, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 3, y }, boardWidth, boardHeight, keyPoint);
    } else { // start point is bottom
        placeTerrain(board, { x, y: y - 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x, y: y - 2 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x, y: y - 3 }, boardWidth, boardHeight, keyPoint);
    }
};

const bentLine = (board, { x, y }, boardWidth, boardHeight, keyPoint) => {
    const option = Math.floor(Math.random() * 4);
    placeTerrain(board, { x, y }, boardWidth, boardHeight, keyPoint);
    if (option === 0) {	// start point is top
        placeTerrain(board, { x, y: y + 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x, y: y + 2 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 1, y: y + 2 }, boardWidth, boardHeight, keyPoint);
    } else if (option === 1) { // start point is left
        placeTerrain(board, { x: x + 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 2, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 2, y: y - 1 }, boardWidth, boardHeight, keyPoint);
    } else if (option === 2) { // start point is right
        placeTerrain(board, { x: x - 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 2, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 2, y: y + 1 }, boardWidth, boardHeight, keyPoint);
    } else { // start point is bottom
        placeTerrain(board, { x, y: y - 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x, y: y - 2 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y: y - 2 }, boardWidth, boardHeight, keyPoint);
    }
};

const zShape = (board, { x, y }, boardWidth, boardHeight, keyPoint) => {
    const option = Math.floor(Math.random() * 4);
    placeTerrain(board, { x, y }, boardWidth, boardHeight, keyPoint);
    if (option === 0) {	// start point is top
        placeTerrain(board, { x, y: y + 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y: y + 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y: y + 2 }, boardWidth, boardHeight, keyPoint);
    } else if (option === 1) { // start point is left
        placeTerrain(board, { x: x + 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 1, y: y + 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x + 2, y: y + 1 }, boardWidth, boardHeight, keyPoint);
    } else if (option === 2) { // start point is right
        placeTerrain(board, { x: x - 1, y }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y: y + 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 2, y: y + 1 }, boardWidth, boardHeight, keyPoint);
    } else { // start point is bottom
        placeTerrain(board, { x, y: y - 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y: y - 1 }, boardWidth, boardHeight, keyPoint);
        placeTerrain(board, { x: x - 1, y: y - 2 }, boardWidth, boardHeight, keyPoint);
    }
};

const terrainFunctions = [
    square,
    line,
    bentLine,
    zShape
];

const getRandomTerrain = () => {
    return terrainFunctions[Math.floor(Math.random() * terrainFunctions.length)];
};

const getRandomStartPoint = (boardWidth, boardHeight, keyPoint) => {
    const startPoint = {
        x: Math.floor(Math.random() * boardWidth),
        y: Math.floor(Math.random() * boardHeight)
    };
    while (startPoint.x === keyPoint.x && startPoint.y === keyPoint.y) {
        startPoint.x = Math.floor(Math.random() * boardWidth);
        startPoint.y = Math.floor(Math.random() * boardHeight);
    }
    return startPoint;
};

module.exports = {
    getRandomTerrain,
    getRandomStartPoint
};