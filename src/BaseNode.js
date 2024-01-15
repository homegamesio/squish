const InternalGameNode = require('./InternalGameNode');

const gameNode = (color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, subtype, id) => {
    return new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input, subtype, id);
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

    addChild(child, notifyListeners = true) {
        this.node.addChild(child);
        if (notifyListeners) {
            this.node.onStateChange();
        }
    }

    addChildren(...nodes) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex], false);
        }

        this.node.onStateChange();
    }

    getChildren() {
        return this.node.children;
    }

    removeChild(nodeId, notifyListeners = true) {
        this.node.removeChild(nodeId);
        if (notifyListeners) {
            this.node.onStateChange();
        }
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
        this.node.onStateChange();
    }

    update( params = {} ) {
        if (params) {
            if (params.fill) {
                this.node.fill = params.fill;
            }
            if (params.coordinates2d) {
                this.node.coordinates2d = coordinates2d;
            }
        }
        this.node.onStateChange();
    }

    clone() {
        throw new Error("Clone not implemented");
    }
}


module.exports = {gameNode, BaseNode};
