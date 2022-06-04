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
            }

            if (shouldInclude) {
                const copied = node.clone({handleClick: node.node.handleClick === null || node.node.handleClick === undefined ? null : node.node.handleClick});
                
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
                        Object.values(copied.node.asset)[0].pos.x = firstPoint[0];
                        Object.values(copied.node.asset)[0].pos.y = firstPoint[1];
                        Object.values(copied.node.asset)[0].size.x = width;
                        Object.values(copied.node.asset)[0].size.y = height;   
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