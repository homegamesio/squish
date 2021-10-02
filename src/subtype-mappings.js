const { GameNode } = require('./GameNode');
const subtypes = require('./subtypes');

console.log("got these things! abc");

module.exports = {
    [[subtypes.ASSET]]: GameNode.Asset,
    [[subtypes.TEXT]]: GameNode.Text,
    [[subtypes.SHAPE_2D_POLYGON]]: GameNode.Shape,
    [[subtypes.SHAPE_2D_CIRCLE]]: GameNode.Shape,
    [[subtypes.SHAPE_2D_LINE]]: GameNode.Shape
};
