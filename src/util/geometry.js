const collisionHelper = (node, nodeToCheck, filter, collisions = []) => {
    // assume rectangles for now

    if (!filter || (filter(node) && node.node.id !== nodeToCheck.node.id)) {
        // if (node.node.coordinates2d)
        const nodeText = node.node.text;
        // const vertices = [nodeText.x, nodeText.y, nodeText.x, nodeText.y]; 
        const vertices = node.node.coordinates2d || [
            [nodeText.x, nodeText.y], 
            [nodeText.x, nodeText.y],
            [nodeText.x, nodeText.y],
            [nodeText.x, nodeText.y],
            [nodeText.x, nodeText.y]
        ];
        const verticesToCheck = nodeToCheck.node.coordinates2d;

        // console.log("to check");
        // console.log(verticesToCheck);

        // console.log("VERRRR");
        // console.log(vertices);
        const node1LeftX = vertices[0][0];//node.node.coordinates2d[0][0];//node.pos.x;
        const node1RightX = vertices[1][0];//node.node.coordinates2d[1][0];//node.pos.x + node.size.x;
        const node2LeftX = verticesToCheck[0][0];//nodeToCheck.pos.x;
        const node2RightX = verticesToCheck[1][0];//nodeToCheck.pos.x + nodeToCheck.size.x;

        const node1TopY = vertices[0][1];//node.pos.y;
        const node1BottomY = vertices[2][1];//node.pos.y + node.size.y;
        const node2TopY = verticesToCheck[0][1];//nodeToCheck.pos.y;
        const node2BottomY = verticesToCheck[2][1];//nodeToCheck.pos.y + nodeToCheck.size.y;

        const oneToTheLeft = node2RightX < node1LeftX || node1RightX < node2LeftX;
        const oneBelow = node1TopY > node2BottomY || node2TopY > node1BottomY;
        if (!(oneToTheLeft || oneBelow)) {
            collisions.push(node);
        }
        // } else if (node.node.text) {
        //     console.log('collide with text?');
        //     console.log(node);
        //     const nodeText = node.node.text;
        //     const vertices = [nodeText.x, nodeText.y, nodeText.x, nodeText.y];
        // }
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
