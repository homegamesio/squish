const { getRandomTerrain, getRandomStartPoint } = require('./terrainFunctions');
const terrainGenerator = (boardBounds = { x: 100, y: 100 }, terrainBounds = { x: 5, y: 5 }, numberOfTerrainElements = 5) => {
    const { width, height } = getBoardDimensions(boardBounds, terrainBounds);
    let board = initializeBoard(width, height);
    const keyPoint = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height)
    };
    board = generateTerrain(board, keyPoint, numberOfTerrainElements, width, height);
    return board;
};

const getBoardDimensions = (boardBounds, terrainBounds)  => {
    const boardX = boardBounds.x;
    const boardY = boardBounds.y;
    const terrainX = terrainBounds.x;
    const terrainY = terrainBounds.y;
    return {
        width: Math.floor(boardX/terrainX),
        height: Math.floor(boardY/terrainY)
    };
};

const initializeBoard = (width, height) => {
    const board = [];

    const defaultInfo = {
        filled: false,
        north: true,
        south: true,
        east: true,
        west: true
    };

    for(let i = 0; i < width; i++) {
        board[i] = [];
        for (let j = 0; j < height; j++) {
            const info = { ...defaultInfo };
            if (i === 0) {
                info.west = false;
            } else if (i === width - 1) {
                info.east = false;
            }
            if (j === 0) {
                info.north = false;
            } else if (j === height - 1) {
                info.south = false;
            }
            board[i].push(info);
        }
    }
    return board;
};

const deepClone = (toCopy) => {
    const toReturn = [];
    toCopy.forEach((row, rowNum) => {
        toReturn[rowNum] = [];
        row.forEach(elem => {
            toReturn[rowNum].push({ ...elem });
        });
    });
    return toReturn;
};

const cleanUpBoard = (board) => {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            board[i][j] = {
                filled: board[i][j].filled,
                north: board[i][j].north,
                south: board[i][j].south,
                east: board[i][j].east,
                west: board[i][j].west
            };
        }
    }
};

const verifyKeyPoint = (board, keyPoint, boardWidth, boardHeight) => {
    const pointsVerified = [];
    for (let x = 0; x < boardWidth; x++) {
        for (let y = 0; y < boardHeight; y++) {
            const pointsOnCurrentPath = [];
            const currentPoint = { x, y };
            while(true) {
                const boardPoint = board[currentPoint.x][currentPoint.y];
                if (
                    (pointsVerified.findIndex(point => point.x === currentPoint.x && point.y === currentPoint.y) > -1) ||
                    (currentPoint.x === keyPoint.x && currentPoint.y === keyPoint.y) ||
                    (boardPoint.filled)
                ) {
                     /*
                        if we already know we can reach the keyPoint from our test point or
                        if we are at the key point or
                        if we are in a filled point, just skip the iteration, no need to test this point further
                    */
                    pointsVerified.push(...pointsOnCurrentPath);
                    break;
                } else if(
                    (!boardPoint.north || boardPoint.wentNorth) &&
                    (!boardPoint.south || boardPoint.wentSouth) &&
                    (!boardPoint.east || boardPoint.wentEast) &&
                    (!boardPoint.west || boardPoint.wentWest)
                ) {
                    /*
                        if we have exhausted all possible movements for a point, and not reached the keypoint
                        then this possibleBoard is not workable
                    */
                    return false;
                }
                pointsOnCurrentPath.push({ ...currentPoint });
                if (boardPoint.south && !boardPoint.wentSouth) {
                    boardPoint.wentSouth = true;
                    currentPoint.y = currentPoint.y + 1;
                } else if (boardPoint.east && !boardPoint.wentEast) {
                    boardPoint.wentEast = true;
                    currentPoint.x = currentPoint.x + 1;
                } else if (boardPoint.north && !boardPoint.wentNorth) {
                    boardPoint.wentNorth = true;
                    currentPoint.y = currentPoint.y - 1;
                } else if (boardPoint.west && !boardPoint.wentWest) {
                    boardPoint.wentWest = true;
                    currentPoint.x = currentPoint.x - 1;
                } else {
                    return false;
                }
            }
            cleanUpBoard(board);
        }
    }
    return true;
};

const generateTerrain = (board, keyPoint, toPlace, boardWidth, boardHeight, numberOfIterations = 0) => {
    if (toPlace === 0 || numberOfIterations === 3) {
        return board;
    }
    const possibleBoard = deepClone(board);
    const terrainFunction = getRandomTerrain();
    const terrainStartPoint = getRandomStartPoint(boardWidth, boardHeight, keyPoint);
    terrainFunction(possibleBoard, terrainStartPoint, boardWidth, boardHeight, keyPoint);
    const temp = verifyKeyPoint(possibleBoard, keyPoint, boardWidth, boardHeight);
    if (temp) {
        return generateTerrain(possibleBoard, keyPoint, toPlace - 1, boardWidth, boardHeight, 0);
    } else {
        return generateTerrain(board, keyPoint, toPlace, boardWidth, boardHeight, numberOfIterations + 1);
    }
};

module.exports = {
    terrainGenerator
};
