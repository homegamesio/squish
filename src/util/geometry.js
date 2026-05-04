const collisionHelper = (node, nodeToCheck, filter, collisions, checkCoords) => {
    // assume rectangles for now

    if (!filter || (filter(node) && node.node.id !== nodeToCheck.node.id)) {
        // todo: clean this up its gross
        // text does not have coordinates, so make a fake vertices array from the starting point of the text
        let node1LeftX, node1RightX, node1TopY, node1BottomY;

        if (node.node.coordinates2d) {
            const coords = node.node.coordinates2d;
            node1LeftX = coords[0][0];
            node1RightX = coords[1][0];
            node1TopY = coords[0][1];
            node1BottomY = coords[2][1];
        } else if (node.node.text) {
            // Text node — point collision (no extent)
            node1LeftX = node1RightX = node.node.text.x;
            node1TopY = node1BottomY = node.node.text.y;
        }

        // Use pre-extracted check coordinates to avoid repeated array access
        const oneToTheLeft = checkCoords.rightX < node1LeftX || node1RightX < checkCoords.leftX;
        const oneBelow = node1TopY > checkCoords.bottomY || checkCoords.topY > node1BottomY;
        if (!(oneToTheLeft || oneBelow)) {
            collisions.push(node);
        }
    }

    const children = node.node.children;
    for (let i = 0; i < children.length; i++) {
        collisionHelper(children[i], nodeToCheck, filter, collisions, checkCoords);
    }

    return collisions;
};

const checkCollisions = (root, node, filter = null) => {
    // Pre-extract the check node's bounds once instead of reading from
    // arrays on every recursive call
    const coords = node.node.coordinates2d;
    const checkCoords = {
        leftX: coords[0][0],
        rightX: coords[1][0],
        topY: coords[0][1],
        bottomY: coords[2][1]
    };
    return collisionHelper(root, node, filter, [], checkCoords);
};

module.exports = { checkCollisions };
