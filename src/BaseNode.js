const listenable = require("./util/listenable");
const InternalGameNode = require('./InternalGameNode');

const gameNode = (color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, subtype, id) => {
    const node = new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, subtype, id);
    return listenable(node, node.onStateChange.bind(node));
};

class BaseNode {
    constructor({color, onClick, coordinates2d, border, fill, textInfo, assetInfo, playerIds, effects, input, subtype, node, id}) {
        if (node) {
            this.node = node;
        } else {
            this.node = gameNode(color, onClick, coordinates2d, border, fill, textInfo, assetInfo, playerIds, effects, input, subtype, id);
        }

        this.id = this.node.id;
    }

    showFor(playerId) {
        const playerIdIndex = this.node.playerIds.indexOf(playerId);
        const zeroIndex = this.node.playerIds.indexOf(0);

        if (zeroIndex >= 0) {
            const newPlayerIds = this.node.playerIds;
            newPlayerIds.splice(zeroIndex, 1);
            this.node.playerIds = newPlayerIds;
        }
        if (playerIdIndex < 0) {
            const newPlayerIds = this.node.playerIds;
            newPlayerIds.push(playerId);
            this.node.playerIds = newPlayerIds;
        }
    }

    hideFor(playerId) {
        const playerIdIndex = this.node.playerIds.indexOf(playerId);
        if (playerIdIndex >= 0) {
            let newPlayerIds = this.node.playerIds;
            newPlayerIds.splice(playerIdIndex, 1);
            if (newPlayerIds.length == 0) {
                newPlayerIds = [0];
            }
            this.node.playerIds = newPlayerIds;
        }
    }

    addChild(child) {
        this.node.addChild(child);
    }

    addChildren(...nodes) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex]);
        }
    }

    getChildren() {
        return this.node.children;
    }

    removeChild(nodeId) {
        this.node.removeChild(nodeId);
    }

    addListener(listener) {
        this.node.addListener(listener);
    }

    findChild(id) {
        return this.findChildHelper(id, this);
    }

    findChildHelper(nodeId, node, found = null) {
        if (node.node.id === nodeId) {
            found = node;
        }

        for (const i in node.node.children) {
            if (found) {
                return found
            }
            found = this.findChildHelper(nodeId, node.node.children[i], found);
        }

        return found;
    }


    clearChildren(excludedNodeIds) {
        this.node.clearChildren(excludedNodeIds);
    }


    clone() {
        throw new Error("Clone not implemented");
    }
}


module.exports = {gameNode, BaseNode};