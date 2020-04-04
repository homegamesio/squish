const listenable = require("./util/listenable");

let id = 0;

class GameNode {
    constructor(color, onClick, pos, size, text, asset, playerId = 0, effects = null) {
        this.id = id++;
        this.children = new Array();
        this.color = color;
        this.handleClick = onClick;
        this.pos = pos;
        this.size = size;
        this.text = text;
        this.asset = asset;
        this.effects = effects;
        this.listeners = new Set();
        this.playerId = Number(playerId);
    }

    addChild(node) {
        this.children.push(node);
        this.onStateChange();
    }

    removeChild(nodeId) {
        const removeIndex = this.children.findIndex(child => child.id == nodeId);
        removeIndex >= 0 && this.children.splice(removeIndex, 1);
        // hack to invoke update listener
        this.id = this.id;
    }

    addListener(listener) {
        this.listeners.add(listener);
    }

    onStateChange() {
        for (const listener of this.listeners) {
            listener.handleStateChange(this);
        }
    }

    clearChildren(excludedNodeIds) {
        if (!excludedNodeIds) {
            this.children = new Array();
        } else {
            const newChildren = this.children.filter(child => {
                return excludedNodeIds.includes(child.id);
            });
            this.children = newChildren;
        }
    }
}

const gameNode = (color, onClick, pos, size, text, asset, playerId, effects) => {
    const node = new GameNode(color, onClick, pos, size, text, asset, playerId, effects);
    return listenable(node, node.onStateChange.bind(node));
};

module.exports = gameNode;
