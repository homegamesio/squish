const { GameNode } = require('../GameNode');
const Shapes = require('../Shapes');
const ShapeUtils = require('./shapes');
const GeometryUtils = require('./geometry');
const Colors = require('../Colors');

const getView = (plane, view, playerIds, translation = {}) => {

    const wouldBeCollisions = GeometryUtils.checkCollisions(plane, {node: {coordinates2d: ShapeUtils.rectangle(view.x, view.y, view.w, view.h)}}, (node) => {
        return node.node.id !== plane.node.id;
    });

    const convertedRoot = new GameNode.Shape({
        shapeType: Shapes.POLYGON,
        coordinates2d: ShapeUtils.rectangle(0, 0, 0, 0),
        fill: Colors.COLORS.BLACK
    });

    const convertedNodes = [];

    // console.log("ayyyy lmao");
    // console.log(view);
    if (wouldBeCollisions.length > 0) {
        wouldBeCollisions.forEach(node => {
            let shouldInclude = true;
            // need to slice piece of coordinates
            // need a clone method
            const translatedCoords = [];
            for (let coorPairIndex in node.node.coordinates2d) {
                const coordPair = node.node.coordinates2d[coorPairIndex];
                // console.log(coordPair);
                const x = coordPair[0];
                const y = coordPair[1];
                // console.log('i need to look at the point at ' + view.x);
                let translatedX = Math.max(Math.min(x - view.x, 100), 0);
                let translatedY = Math.max(Math.min(y - view.y, 100), 0);

                const shouldTranslate = translation.filter ? translation.filter(node) : true;

                if (shouldTranslate) {
                    if (translation.x) {
                        translatedX += translation.x;
                    }

                    if (translation.y) {
                        translatedY += translation.y;
                    }

                    if (translatedX < 0 || translatedX > 100) {
                        shouldInclude = false;
                    }

                    if (translatedY < 0 || translatedY > 100) {
                        shouldInclude = false;
                    }
                }

                const xScale = 1//100 / (view.w || 100);
                const yScale = 1//100 / (view.h || 100);

                // console.log("t: " + translatedX + ", " + translatedY);
                translatedX = xScale * translatedX;
                translatedY = yScale * translatedY;

                translatedCoords.push([translatedX, translatedY]);
            }

            if (shouldInclude) {
                const copied = node.clone({handleClick: node.node.handleClick === null || node.node.handleClick === undefined ? null : node.node.handleClick});
                
                copied.node.coordinates2d = translatedCoords;
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