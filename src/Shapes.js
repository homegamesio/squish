const Shapes = {
    CIRCLE: 1,
    POLYGON: 2,
    LINE: 3
};

Shapes.RECTANGLE = (startX, startY, width, height) => {
    return [
        [startX, startY],
        [startX + width, startY],
        [startX + width, startY + height],
        [startX, startY + height],
        [startX, startY],
    ];
};

Shapes.TRIANGLE = (x1, y1, x2, y2, x3, y3) => {
    return [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x1, y1]
    ];
};

module.exports = Shapes;

