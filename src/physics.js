const Physics = {
    getPath: (startX, startY, xVel, yVel, endX = 100, endY = 100) => {
        const path = [];
        let withinEdges = true;
        while (withinEdges) {
            const curX = path.length === 0 ? startX : path[path.length - 1][0];
            const curY = path.length === 0 ? startY : path[path.length - 1][1];
            
            const newX = curX + xVel;
            const newY = curY + yVel;
            
            if (newX < 0 || newX > endX || newY < 0 || newY > endY) {
                withinEdges = false;
            } else {
                path.push([newX, newY]);
            }
        }

        return path;
    }
};

module.exports = Physics;

