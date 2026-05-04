const { GameNode } = require('../GameNode');
const Shapes = require('../Shapes');
const ShapeUtils = require('./shapes');
const GeometryUtils = require('./geometry');
const Colors = require('../Colors');

const getView = (plane, view, playerIds, translation = {}, scale = {}) => {

    // Build the collision check node inline instead of via ShapeUtils.rectangle()
    // to avoid allocating a throwaway coordinate array.
    const viewCheckNode = {node: {coordinates2d: [
        [view.x, view.y],
        [view.x + view.w, view.y],
        [view.x + view.w, view.y + view.h],
        [view.x, view.y + view.h],
        [view.x, view.y]
    ]}};

    const planeId = plane.node.id;
    const wouldBeCollisions = GeometryUtils.checkCollisions(plane, viewCheckNode, (node) => {
        return node.node.id !== planeId;
    });

    const convertedRoot = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(0, 0, 0, 0),
        fill: Colors.COLORS.BLACK
    });

    const scaleX = scale.x || 1;
    const scaleY = scale.y || 1;
    const transX = translation.x || 0;
    const transY = translation.y || 0;
    const hasTransFilter = !!translation.filter;
    const pIds = playerIds || [];

    for (let ni = 0; ni < wouldBeCollisions.length; ni++) {
        const node = wouldBeCollisions[ni];

        // same hack as geometry utils — text nodes lack coordinates2d
        const vertices = node.node.coordinates2d || [
            [node.node.text.x, node.node.text.y], 
            [node.node.text.x, node.node.text.y], 
            [node.node.text.x, node.node.text.y], 
            [node.node.text.x, node.node.text.y],
            [node.node.text.x, node.node.text.y]
        ];

        // Pre-allocate translated coords array at the right size
        const translatedCoords = new Array(vertices.length);
        const shouldTranslate = hasTransFilter ? translation.filter(node) : true;

        for (let ci = 0; ci < vertices.length; ci++) {
            let tx = Math.max(Math.min(vertices[ci][0] - view.x, 100), 0) * scaleX;
            let ty = Math.max(Math.min(vertices[ci][1] - view.y, 100), 0) * scaleY;

            if (shouldTranslate) {
                tx += transX;
                ty += transY;
            }

            // Clamp
            if (tx < 0) tx = 0; else if (tx > 100) tx = 100;
            if (ty < 0) ty = 0; else if (ty > 100) ty = 100;

            translatedCoords[ci] = [tx, ty];
        }

        const copied = node.clone({handleClick: node.node.handleClick == null ? null : node.node.handleClick});
        
        if (copied.node.text) {
            copied.node.text.x = translatedCoords[0][0];
            copied.node.text.y = translatedCoords[0][1];
        } 
        copied.node.coordinates2d = translatedCoords;

        if (copied.node.asset) {
            const firstPoint = translatedCoords[0];
            const secondPoint = translatedCoords[1];
            const thirdPoint = translatedCoords[2];
            const width = secondPoint[0] - firstPoint[0];
            const height = thirdPoint[1] - secondPoint[1];
            const assetVal = Object.values(copied.node.asset)[0];
            assetVal.pos.x = firstPoint[0];
            assetVal.pos.y = firstPoint[1];
            assetVal.size.x = width;
            assetVal.size.y = height;   
        }

        copied.node.playerIds = pIds;
        convertedRoot.addChild(copied);
    }

    return convertedRoot;
};

module.exports = {
    getView
}