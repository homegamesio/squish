let id = 0;

class InternalGameNode {
    constructor(color, onClick, coordinates2d, border, fill, text, asset, playerIds = [], effects = null, input = null) {
        this.id = id++;
        this.children = new Array();
        this.color = color;
        this.handleClick = onClick;
        this.coordinates2d = coordinates2d;
        this.border = border;
        this.fill = fill;
        this.text = text;
        this.asset = asset;
        this.effects = effects;
        this.input = input;
        this.listeners = new Set();
        this.playerIds = playerIds || [];
    }

    addChild(node) {
        this.children.push(node);
        this.onStateChange();
    }

    addChildren(...nodes) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex]);
        }
    }

    removeChild(nodeId) {
        const removeIndex = this.children.findIndex(child => child.node.id == nodeId);
        if (removeIndex >= 0) {
            if (this._animation) {
                clearInterval(this._animation);
            }
            this.children.splice(removeIndex, 1);
            // hack to invoke update listener
            this.id = this.id;
        }
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

module.exports = InternalGameNode;

