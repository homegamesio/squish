const { getRandomTerrainFunction } = require('./terrainFunctions');
const terrainGenerator = (boardBounds = { x: 100, y: 100 }, terrainBounds = { x: 5, y: 5 }, numberOfTerrainElements = 5) => {
    let { mockArray, mockWidth, mockHeight } = createMockArray(boardBounds, terrainBounds);
    const keyPoint = {
        x: Math.floor(Math.random() * mockWidth),
        y: Math.floor(Math.random() * mockHeight)
    };
    mockArray = generateTerrain(mockArray, keyPoint, numberOfTerrainElements, mockWidth, mockHeight);
    return mockArray;
};

createMockArray = (boardBounds, terrainBounds) => {
    const boardX = boardBounds.x;
    const boardY = boardBounds.y;
    const terrainX = terrainBounds.x;
    const terrainY = terrainBounds.y;

    const mockArray = [];
    const mockWidth =  boardX/terrainX;
    const mockHeight = boardY/terrainY;

    const defaultInfo = {
        filled: false,
        north: true,
        south: true,
        east: true,
        west: true
    };

    for(let i = 0; i < mockWidth; i++) {
        mockArray[i] = [];
        for (let j = 0; j < mockHeight; j++) {
            const info = { ...defaultInfo };
            if (i === 0) {
                info.west = false;
            } else if (i === mockWidth - 1) {
                info.east = false;
            }
            if (j === 0) {
                info.north = false;
            } else if (j === mockHeight - 1) {
                info.south = false;
            }
            mockArray[i].push(info);
        }
    }
    return {
        mockArray,
        mockWidth,
        mockHeight
    };
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
            let test = { x, y };
            if ((pointsVerified.findIndex(point => point.x === test.x && point.y === test.y) > -1) ||
                (test.x === keyPoint.x && test.y === keyPoint.y) ||
                (board[test.x][test.y].filled)
            ) {
                continue;
            }
            const pointsOnCurrentPath = [];
            const currentPoint = { ...test };
            while(true) {
                const boardPoint = board[currentPoint.x][currentPoint.y];
                if (
                    (pointsVerified.findIndex(point => point.x === currentPoint.x && point.y === currentPoint.y) > -1) ||
                    (currentPoint.x === keyPoint.x && currentPoint.y === keyPoint.y)
                ) {
                    pointsVerified.push(...pointsOnCurrentPath);
                    break;
                } else if(
                    (!boardPoint.north || boardPoint.wentNorth) &&
                    (!boardPoint.south || boardPoint.wentSouth) &&
                    (!boardPoint.east || boardPoint.wentEast) &&
                    (!boardPoint.west || boardPoint.wentWest)
                ) {
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

const generateTerrain = (mockArray, keyPoint, toPlace, boardWidth, boardHeight, numberOfIterations = 0) => {
    if (toPlace === 0 || numberOfIterations === 3) {
        return mockArray;
    }
    const mockCopy = deepClone(mockArray);
    const terrainFunction = getRandomTerrainFunction();
    const mockPlacement = {
        x: Math.floor(Math.random() * boardWidth),
        y: Math.floor(Math.random() * boardHeight)
    };
    while (mockPlacement.x === keyPoint.x && mockPlacement.y === keyPoint.y) {
        mockPlacement.x = Math.floor(Math.random() * boardWidth);
        mockPlacement.y = Math.floor(Math.random() * boardHeight);
    }
    terrainFunction(mockCopy, mockPlacement, boardWidth, boardHeight, keyPoint);
    const temp = verifyKeyPoint(mockCopy, keyPoint, boardWidth, boardHeight);
    if (temp) {
        return generateTerrain(mockCopy, keyPoint, toPlace - 1, boardWidth, boardHeight, 0);
    } else {
        return generateTerrain(mockArray, keyPoint, toPlace, boardWidth, boardHeight, numberOfIterations + 1);
    }
};

module.exports = {
    terrainGenerator
};