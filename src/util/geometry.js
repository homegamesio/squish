const collisionHelper = (node, nodeToCheck, filter, collisions = []) => {
    // assume rectangles for now

    if (!filter || (filter(node) && node.node.id !== nodeToCheck.node.id)) {
        // todo: clean this up its gross
        // text does not have coordinates, so make a fake vertices array from the starting point of the text
        const nodeText = node.node.text;
        const vertices = node.node.coordinates2d || [
            [nodeText.x, nodeText.y], 
            [nodeText.x, nodeText.y],
            [nodeText.x, nodeText.y],
            [nodeText.x, nodeText.y],
            [nodeText.x, nodeText.y]
        ];
        const verticesToCheck = nodeToCheck.node.coordinates2d;

        const node1LeftX = vertices[0][0];
        const node1RightX = vertices[1][0];
        const node2LeftX = verticesToCheck[0][0];
        const node2RightX = verticesToCheck[1][0];

        const node1TopY = vertices[0][1];
        const node1BottomY = vertices[2][1];
        const node2TopY = verticesToCheck[0][1];
        const node2BottomY = verticesToCheck[2][1];

        const oneToTheLeft = node2RightX < node1LeftX || node1RightX < node2LeftX;
        const oneBelow = node1TopY > node2BottomY || node2TopY > node1BottomY;
        if (!(oneToTheLeft || oneBelow)) {
            collisions.push(node);
        }
    }

    for (const child in node.node.children) {
        collisionHelper(node.node.children[child], nodeToCheck, filter, collisions);
    }

    return collisions;
};

const checkCollisions = (root, node, filter = null) => {
    return collisionHelper(root, node, filter);
};

module.exports = { checkCollisions };
