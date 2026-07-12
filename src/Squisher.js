const ASSET_TYPE = 1;

const { squish, unsquish } = require('./squish');

const INVISIBLE_PLAYER_ID = 0;
const DEFAULT_TICK_RATE = 60;

class Squisher {
    constructor({ game, scale, customBottomLayer, customTopLayer, onAssetUpdate }) {
        this.ids = new Set();

        this.game = game;
        this.gameMetadata = game.constructor.metadata && game.constructor.metadata();
        this._assetBufferCache = {};
        this.playerSettings = {};

        this.customBottomLayer = customBottomLayer;
        this.customTopLayer = customTopLayer;

        this.initialize();
        this.onAssetUpdate = onAssetUpdate;

        this.playerFrames = {};

        this.listeners = new Set();
        // Coalescing: a single tick often mutates many nodes, each firing
        // onStateChange. Instead of re-squishing the whole tree + broadcasting
        // per mutation, we mark dirty and flush once at the end of the event
        // loop turn. Consumers that need the current state synchronously (e.g.
        // sending an initial frame to a player who just joined) call flush().
        this._dirty = false;
        this._flushScheduled = false;
        this.scale = scale || {x: 1, y: 1};
        this.state = this.squish(this.game.getLayers());

        if (this.game.tick) {
            const tickRate = this.gameMetadata && this.gameMetadata.tickRate ? this.gameMetadata.tickRate : DEFAULT_TICK_RATE;
            // Keep the handle so consumers can end the tick loop (repeated
            // session create/destroy in one process leaks it otherwise).
            this._tickInterval = setInterval(this.game.tick.bind(this.game), 1000 / tickRate);
        }
    }

    addListener(onEvent) {
        const listener = {
            onEvent,
            remove: () => this.removeListener(listener)
        };

        this.listeners.add(listener);
    }

    removeListener(listener) {
        this.listeners.delete(listener);
    }

    unsquish(node) {
        return unsquish(node);
    }

    squish(layers, scale = null) {
        
        if (!layers) {
            return [];
        }

        let layerLength = layers.length;

        let toSquish = [];

        const playerMap = {};
        // Shared (visible-to-everyone) nodes in traversal order, kept so a
        // player frame created mid-traversal can be seeded with everything
        // shared that was squished before that player's first scoped node.
        const sharedNodes = [];

        if (this.customBottomLayer) {
            const squishedLayer = [];
            this.squishHelper(this.customBottomLayer.root, squishedLayer, this.customBottomLayer.scale, playerMap, new Set(), sharedNodes);
            toSquish.push(squishedLayer);
        }

        for (const layerIndex in layers) {
            const squishedLayer = [];
            const layerInfo = layers[layerIndex];

            const layerScale = layerInfo.scale ? {
                x: this.scale.x * layerInfo.scale.x,
                y: this.scale.y * layerInfo.scale.y
            } : this.scale;

            this.squishHelper(layerInfo.root, squishedLayer, scale || layerScale, playerMap, new Set(), sharedNodes);
            toSquish.push(squishedLayer);
        }


        if (this.customTopLayer) {
            const squishedLayer = [];
            this.squishHelper(this.customTopLayer.root, squishedLayer, this.customTopLayer.scale, playerMap, new Set(), sharedNodes);
            toSquish.push(squishedLayer);
        }

        this.playerFrames = playerMap;

        return toSquish.flat();
    }

    getPlayerFrame(playerId) {
        return this.playerFrames[playerId];
    }

    handleNewAsset(key, asset) {
        // Invalidate just this key so initialize() re-fetches only its data
        if (this._assetBufferCache) {
            delete this._assetBufferCache[key];
        }
        return this.initialize();
    }

    // Whether an audio node should be withheld from a player who has muted
    // sound. Non-audio nodes (and unregistered assets) are never withheld.
    // Applied consistently in both the player-scoped and broadcast paths.
    _isAudioMutedFor(node, playerId) {
        if (!node.node.asset) return false;
        const assetKey = Object.keys(node.node.asset)[0];
        const assetInfo = this.gameAssets && this.gameAssets[assetKey] && this.gameAssets[assetKey].info;
        if (!assetInfo || assetInfo.type !== 'audio') return false;
        const sound = this.playerSettings[playerId] && this.playerSettings[playerId].SOUND;
        return !!(sound && sound.enabled === false);
    }

    squishHelper(node, squishedNodes, scale = {x: 1, y: 1}, playerMap = {}, playerIdFilter = new Set(), sharedNodes = []) {
        if (!node.node.listeners.has(this)) {
            node.addListener(this);
        }

        const squished = squish(node, scale);
        squishedNodes.push(squished);

        if (node.node.playerIds && node.node.playerIds.length > 0) {
            node.node.playerIds.forEach(pId => playerIdFilter.add(pId));
        }

        if (playerIdFilter.size > 0) {
            let playerIdsToRemove = new Set();
            for (let playerId of playerIdFilter) {
                if (!playerMap[playerId]) {
                    // First scoped node seen for this player. Seed their frame
                    // with every shared node squished so far — otherwise the
                    // frame would be missing everything shared (root
                    // background included) that preceded it in traversal.
                    playerMap[Number(playerId)] = sharedNodes
                        .filter(shared => !this._isAudioMutedFor(shared.node, playerId))
                        .map(shared => shared.squished);
                }

                if (node.node.playerIds.length === 0 || node.node.playerIds.findIndex(i => Number(i) === Number(playerId)) >= 0) {
                    if (!this._isAudioMutedFor(node, playerId)) {
                        playerMap[playerId].push(squished);
                    }
                } else {
                    playerIdsToRemove.add(playerId);
                }
            }
            for (let id of playerIdsToRemove) {
                playerIdFilter.delete(id);
            }
        } else {
            sharedNodes.push({ node, squished });
            Object.keys(playerMap).forEach(playerId => {
                if (!this._isAudioMutedFor(node, playerId)) {
                    playerMap[playerId].push(squished);
                }
            })
        }

        for (let i = 0; i < node.node.children.length; i++) {
//            if (node.node.children[i].node.playerIds
            // make a new set so child calls within a single generation arent
            // modifying the same filter set
            const pathFilter = new Set(playerIdFilter);
            this.squishHelper(node.node.children[i], squishedNodes, scale, playerMap, pathFilter, sharedNodes);
        }

    }

    getJson() {
        const layers = this.game.layers;
        const jsonLayers = new Array(layers.length);
        for (const layerIndex in layers) {
            const layerInfo = layers[layerIndex];
            const jsonLayer = layerInfo.root;
            jsonLayers[layerIndex] = jsonLayer;
        }

        return JSON.stringify(jsonLayers);
    }

    initialize() {
        return new Promise((resolve, reject) => {

                const gameMetadata = this.game.constructor.metadata && this.game.constructor.metadata();

                const gameAssets = gameMetadata && gameMetadata.assets ? gameMetadata.assets : {};
                this.gameAssets = gameAssets;

                if (this.customBottomLayer && this.customBottomLayer.assets) {
                    Object.assign(gameAssets, this.customBottomLayer.assets);
                }
                
                if (this.customTopLayer && this.customTopLayer.assets) {
                    Object.assign(gameAssets, this.customTopLayer.assets);
                }

                if (this.game.getAssets && this.game.getAssets()) {
                    Object.assign(gameAssets, this.game.getAssets());
                }

                const assetTypeMap = {
                    'image': 1,
                    'audio': 2,
                    'font': 3
                };

                const assetKeys = Object.keys(gameAssets);
                const totalCount = assetKeys.length;

                if (totalCount === 0) {
                    this.assetBundle = Buffer.alloc(0);
                    resolve(this.assetBundle);
                    return;
                }

                if (!this._assetBufferCache) {
                    this._assetBufferCache = {};
                }

                let finishedCount = 0;
                const perAssetBuffers = new Array(totalCount);

                for (let idx = 0; idx < totalCount; idx++) {
                    const key = assetKeys[idx];

                    // If we already have a packed buffer for this key, reuse it
                    if (this._assetBufferCache[key]) {
                        perAssetBuffers[idx] = this._assetBufferCache[key];
                        finishedCount += 1;
                        if (finishedCount === totalCount) {
                            this.assetBundle = Buffer.concat(perAssetBuffers);
                            resolve(this.assetBundle);
                        }
                        continue;
                    }

                    gameAssets[key].getData().then(buf => {
                        const assetKeyLength = 32;
                        const encodedMaxLength = 10;

                        const headerLength = 2 + encodedMaxLength + assetKeyLength;
                        const assetBuf = Buffer.alloc(headerLength + buf.length);

                        assetBuf[0] = ASSET_TYPE;
                        assetBuf[1] = assetTypeMap[gameAssets[key].info.type];

                        // Encode the length (data + key length) as base-36, left-padded
                        const encodedLength = (buf.length + assetKeyLength).toString(36);
                        const padLen = encodedMaxLength - encodedLength.length;
                        for (let i = 0; i < padLen; i++) {
                            assetBuf[2 + i] = 48; // '0' charCode
                        }
                        for (let i = 0; i < encodedLength.length; i++) {
                            assetBuf[2 + padLen + i] = encodedLength.charCodeAt(i);
                        }

                        // Write asset key (up to 32 chars, rest stays 0)
                        const keyWriteLen = Math.min(assetKeyLength, key.length);
                        for (let i = 0; i < keyWriteLen; i++) {
                            assetBuf[2 + encodedMaxLength + i] = key.charCodeAt(i);
                        }

                        // Copy the raw asset data
                        if (Buffer.isBuffer(buf)) {
                            buf.copy(assetBuf, headerLength);
                        } else {
                            for (let i = 0; i < buf.length; i++) {
                                assetBuf[headerLength + i] = buf[i];
                            }
                        }

                        this._assetBufferCache[key] = assetBuf;
                        perAssetBuffers[idx] = assetBuf;
                        finishedCount += 1;

                        if (finishedCount === totalCount) {
                            this.assetBundle = Buffer.concat(perAssetBuffers);
                            resolve(this.assetBundle);
                        }
                    }).catch(err => {
                        console.error('Unable to get asset data for key ' + key);
                        console.error(err);
                        reject(err);
                    });
                }

        });
    }

    handleStateChange(node, layerName) {
        if (this.listeners.size === 0) return;
        this._dirty = true;
        if (this._flushScheduled) return;
        this._flushScheduled = true;
        const schedule = (typeof setImmediate === 'function')
            ? setImmediate
            : (fn) => setTimeout(fn, 0);
        schedule(() => this.flush());
    }

    // Squish + broadcast any pending state changes synchronously. Safe to call
    // when nothing is pending (no-op). Coalesces a burst of mutations into a
    // single squish + single broadcast carrying the latest state.
    flush() {
        this._flushScheduled = false;
        if (!this._dirty) return;
        this._dirty = false;
        this.state = this.squish(this.game.getLayers());
        this.broadcast();
    }

    broadcast() {
        for (const listener of this.listeners) {
            listener.onEvent(this.state);
        }
    }

    updatePlayerSettings(playerId, settings) {
        const currentSettings = Object.assign(this.playerSettings[playerId] || {}, settings);
        this.playerSettings[playerId] = currentSettings;
    }

    deletePlayerSettings(playerId) {
        delete this.playerSettings[playerId];
    }

}

module.exports = Squisher;
