export const rectangle = (startX: number, startY: number, width: number, height: number) => {
    return [
        [startX, startY],
        [startX + width, startY],
        [startX + width, startY + height],
        [startX, startY + height],
        [startX, startY],
    ];
};

export const triangle = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
    return [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x1, y1]
    ];
};
