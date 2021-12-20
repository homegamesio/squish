class Game {
    constructor() {
        this.players = {};
        this.spectators = {};
        this.listeners = new Set();
        this.root = null;
        this.intervals = [];
        this.timeouts = [];
    }

    _hgAddPlayer(player) {
        this.players[player.id] = player;
    }

    _hgRemovePlayer(playerId) {
        delete this.players[playerId];
    }

    addStateListener(listener) {
        this.listeners.add(listener);
    }

    removeStateListener(listener) {
        this.listeners.remove(listener);
    }

    getRoot() {
        return this.root;
    }

    findNode(id) {
        let found = null;
        
        if (this.layers) {
            for (let layerIndex in this.layers) {
                found = this.#findNodeHelper(id, this.layers[layerIndex].root);//this.game.getRoot());
            }
        }

        return found;
    }

    #findNodeHelper(nodeId, node, found = null) {
        console.log("i am thing");
        console.log(this.layers);  
        if (node.node.id === nodeId) {
            found = node;
        }

        for (const i in node.node.children) {
            console.log("wht");
            console.log(node.node.children[i]);
            found = this.#findNodeHelper(nodeId, node.node.children[i], found);
        }
        
        return found;
    }

    setInterval(fun, interval) {
        const ticker = setInterval(fun, interval);
        this.intervals.push(ticker);
        return ticker;
    }

    setTimeout(fun, time) {
        const timeout = setTimeout(fun, time);
        this.timeouts.push(timeout);
        return timeout;
    }

    close() {
        for (const i in this.timeouts) {
            const timeout = this.timeouts[i];
            clearTimeout(timeout);
        } 

        for (const i in this.intervals) {
            const interval = this.intervals[i];
            clearInterval(interval);
        }
    }
}

module.exports = Game;

