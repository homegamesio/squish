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
                let _newX = newX;
                let _newY = newY;
                if (newX < 0) {
                    _newX = 0;
                } else if (newX > endX) {
                    _newX = endX;
                }

                if (newY < 0) {
                    _newY = 0;
                } else if (newY > endY) {
                    _newY = endY;
                }

                if (!(path[path.length - 1][0] === _newX || path[path.length - 1][1] === _newY)) {
                    path.push([_newX, _newY]);
                }

                withinEdges = false;
            } else {
                path.push([newX, newY]);
            }
        }

        return path;
    }
};

module.exports = Physics;

