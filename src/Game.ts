import { playerDef, playersDef, gameDef } from './sharedDefs';

type timedFunctionDef = () => void;

export default class Game implements gameDef {
    players: playersDef;
    timeouts: NodeJS.Timeout[];
    intervals: NodeJS.Timer[];
    listeners: any;
    root: any;

    constructor() {
        this.players = {};
        this.listeners = new Set();
        this.root = null;
        this.intervals = [];
        this.timeouts = [];
    }

    _hgAddPlayer(player: playerDef) {
        this.players[player.id] = player;
    }

    _hgRemovePlayer(playerId: number) {
        delete this.players[playerId];
    }

    addStateListener(listener: any) {
        this.listeners.add(listener);
    }

    removeStateListener(listener: any) {
        this.listeners.remove(listener);
    }

    getRoot() {
        return this.root;
    }

    setInterval(fun: timedFunctionDef, interval: number) {
        const ticker = setInterval(fun, interval);
        this.intervals.push(ticker);
        return ticker;
    }

    setTimeout(fun: timedFunctionDef, time: number) {
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
