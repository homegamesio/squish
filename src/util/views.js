const { GameNode } = require('../GameNode');
const Shapes = require('../Shapes');
const ShapeUtils = require('./shapes');
const GeometryUtils = require('./geometry');
const Colors = require('../Colors');

const getView = (plane, view, playerIds, translation = {}, scale = {}) => {

    const wouldBeCollisions = GeometryUtils.checkCollisions(plane, {node: {coordinates2d: ShapeUtils.rectangle(view.x, view.y, view.w, view.h)}}, (node) => {
        return node.node.id !== plane.node.id;
    });

    const convertedRoot = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(0, 0, 0, 0),
        fill: Colors.COLORS.BLACK
    });

    const convertedNodes = [];

    if (wouldBeCollisions.length > 0) {
        wouldBeCollisions.forEach(node => {
            let shouldInclude = true;

            const translatedCoords = [];
            // Same vertices as translatedCoords but WITHOUT the [0,100] viewport
            // clamp. Needed for asset crop math: to know how much of an image
            // falls outside the viewport we need its true (unclamped) extent.
            const rawTranslatedCoords = [];

            // same hack as geometry utils
            const vertices = node.node.coordinates2d || [
                [node.node.text.x, node.node.text.y], 
                [node.node.text.x, node.node.text.y], 
                [node.node.text.x, node.node.text.y], 
                [node.node.text.x, node.node.text.y],
                [node.node.text.x, node.node.text.y]
            ];

            for (let coorPairIndex in vertices) {
                const coordPair = vertices[coorPairIndex];

                const x = coordPair[0];
                const y = coordPair[1];
                let translatedX = Math.max(Math.min(x - view.x, 100), 0);
                let translatedY = Math.max(Math.min(y - view.y, 100), 0);

                translatedX = (scale.x || 1) * translatedX;
                translatedY = (scale.y || 1) * translatedY;

                const shouldTranslate = translation.filter ? translation.filter(node) : true;

                if (shouldTranslate) {
                    if (translation.x) {
                        translatedX += translation.x;
                    }

                    if (translation.y) {
                        translatedY += translation.y;
                    }

                }

                if (translatedX < 0) {
                    translatedX = 0;
                } else if (translatedX > 100) {
                    translatedX = 100;
                } 

                if (translatedY < 0) {
                    translatedY = 0;
                } else if (translatedY > 100) {
                    translatedY = 100;
                }

                translatedCoords.push([translatedX, translatedY]);

                // Unclamped transform of the same vertex (scale + translation,
                // but no clamp to [0,100]). Used only for asset crop below.
                let rawX = (scale.x || 1) * (x - view.x);
                let rawY = (scale.y || 1) * (y - view.y);

                if (shouldTranslate) {
                    if (translation.x) {
                        rawX += translation.x;
                    }
                    if (translation.y) {
                        rawY += translation.y;
                    }
                }

                rawTranslatedCoords.push([rawX, rawY]);
            }

            if (shouldInclude) {
                const copied = node.clone({
                    handleClick: node.node.handleClick === null || node.node.handleClick === undefined ? null : node.node.handleClick,
                    // Preserve the source node's id so each view-clone keeps a
                    // stable id across frames. Without this, clone() assigns a
                    // fresh random id every frame, so the client's hover logic
                    // sees the node "change" every frame and spams onhover/offhover.
                    id: node.node.id
                });
                
                if (translatedCoords && translatedCoords.length) {
                    if (copied.node.text) {
                        copied.node.text.x = translatedCoords[0][0];
                        copied.node.text.y = translatedCoords[0][1];
                    } 
                    if (translatedCoords.length) {
                        copied.node.coordinates2d = translatedCoords;
                    }
                    if (copied.node.asset) {
                        const firstPoint = copied.node.coordinates2d[0];
                        const secondPoint = copied.node.coordinates2d[1];
                        const thirdPoint = copied.node.coordinates2d[2];
                        const width = secondPoint[0] - firstPoint[0];
                        const height = thirdPoint[1] - secondPoint[1];

                        const assetObj = Object.values(copied.node.asset)[0];

                        // pos/size = the clamped, on-screen visible box.
                        assetObj.pos.x = firstPoint[0];
                        assetObj.pos.y = firstPoint[1];
                        assetObj.size.x = width;
                        assetObj.size.y = height;

                        // Crop the source image to the portion clipped by the
                        // viewport. Without this the renderer squashes the whole
                        // image into the (smaller) visible box instead of cutting
                        // off the off-screen part. Using the unclamped corners we
                        // measure how much of the image fell outside [0,100] on
                        // each edge, as a percentage of the image's full span.
                        const rawFirst = rawTranslatedCoords[0]; // top-left
                        const rawThird = rawTranslatedCoords[2]; // bottom-right
                        const fullWidth = rawThird[0] - rawFirst[0];
                        const fullHeight = rawThird[1] - rawFirst[1];

                        if (fullWidth > 0) {
                            assetObj.cropLeft = Math.max(0, (0 - rawFirst[0]) / fullWidth) * 100;
                            assetObj.cropRight = Math.max(0, (rawThird[0] - 100) / fullWidth) * 100;
                        }

                        if (fullHeight > 0) {
                            assetObj.cropTop = Math.max(0, (0 - rawFirst[1]) / fullHeight) * 100;
                            assetObj.cropBottom = Math.max(0, (rawThird[1] - 100) / fullHeight) * 100;
                        }
                    }
                } 
                copied.node.playerIds = playerIds || [];
                convertedNodes.push(copied);
            }
        });
    }

    convertedNodes.forEach(c => convertedRoot.addChild(c));

    return convertedRoot;
};

module.exports = {
    getView
}