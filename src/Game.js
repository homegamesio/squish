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
        this.thing();
    }

    #thing() {
        console.log("i am thing");
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

