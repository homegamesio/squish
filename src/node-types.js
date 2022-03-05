const { GameNode } = require('./GameNode');

module.exports = {
    CONSTRUCTOR_TO_TYPE: {
        'Asset': 1,
        'Shape': 2,
        'Text': 3
    },

    TYPE_TO_CONSTRUCTOR: {
        1: GameNode.Asset,
        2: GameNode.Shape,
        3: GameNode.Text
    }
};
