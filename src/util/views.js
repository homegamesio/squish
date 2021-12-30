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
            // console.log("what ti dsfdf");
            // console.log(node);
            let shouldInclude = true;
            // need to slice piece of coordinates
            // need a clone method
            const translatedCoords = [];
            const vertices = node.node.coordinates2d || [
                [node.node.text.x, node.node.text.y], 
                [node.node.text.x, node.node.text.y], 
                [node.node.text.x, node.node.text.y], 
                [node.node.text.x, node.node.text.y],
                [node.node.text.x, node.node.text.y]
            ];
            // console.log('dfsgsdfgdsfgdfsg');
            // console.log(node.node.coordinates2d);
            // console.log(vertices);
            // console.log('what tht eff ');
            // console.log(node.node.coordinates2d);
            for (let coorPairIndex in vertices) {
                const coordPair = vertices[coorPairIndex];
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
                // console.log('including this');
                // console.log(node);
                const copied = node.clone({handleClick: node.node.handleClick === null || node.node.handleClick === undefined ? null : node.node.handleClick});
                
                if (translatedCoords && translatedCoords.length) {
                    if (copied.node.text) {
                        // disgusting hack and i am ashamed
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
                // console.log('whhdsfdsf');
                // console.log(copied.node);
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