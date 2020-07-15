const rectangle = (startX, startY, width, height) => {
    return [
        [startX, startY],
        [startX + width, startY],
        [startX + width, startY + height],
        [startX, startY + height],
        [startX, startY],
    ];
};

const triangle = (x1, y1, x2, y2, x3, y3) => {
    return [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x1, y1]
    ];
};


module.exports = {
    triangle,
    rectangle
}
