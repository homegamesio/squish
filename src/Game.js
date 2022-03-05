class Game {
    constructor() {
        this.players = {};
        this.spectators = {};
        this.listeners = new Set();
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

    findNode(id) {
        let found = null;
        
        if (this.getLayers) {
            const layers = this.getLayers();
            for (let layerIndex in layers) {
                found = layers[layerIndex].root.findChild(id);
                if (found) {
                    break;
                }
            }
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

