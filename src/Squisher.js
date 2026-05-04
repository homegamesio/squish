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
        this.scale = scale || {x: 1, y: 1};
        this.state = this.squish(this.game.getLayers());

        if (this.game.tick) {
            const tickRate = this.gameMetadata && this.gameMetadata.tickRate ? this.gameMetadata.tickRate : DEFAULT_TICK_RATE;
            setInterval(this.game.tick.bind(this.game), 1000 / tickRate);
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

        if (this.customBottomLayer) {
            const squishedLayer = [];
            this.squishHelper(this.customBottomLayer.root, squishedLayer, this.customBottomLayer.scale, playerMap);
            toSquish.push(squishedLayer);
        }
        
        for (const layerIndex in layers) {
            const squishedLayer = [];
            const layerInfo = layers[layerIndex];
            
            const layerScale = layerInfo.scale ? {
                x: this.scale.x * layerInfo.scale.x,
                y: this.scale.y * layerInfo.scale.y
            } : this.scale;

            this.squishHelper(layerInfo.root, squishedLayer, scale || layerScale, playerMap);
            toSquish.push(squishedLayer);
        }


        if (this.customTopLayer) {            
            const squishedLayer = [];
            this.squishHelper(this.customTopLayer.root, squishedLayer, this.customTopLayer.scale, playerMap);
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

    squishHelper(node, squishedNodes, scale = {x: 1, y: 1}, playerMap = {}, playerIdFilter = new Set()) {
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
                    playerMap[Number(playerId)] = [];
                } 

                if (node.node.playerIds.length === 0 || node.node.playerIds.findIndex(i => Number(i) === Number(playerId)) >= 0) {
                    playerMap[playerId].push(squished);
                } else {
                    playerIdsToRemove.add(playerId);
                }
            }
            for (let id of playerIdsToRemove) {
                playerIdFilter.delete(id);
            }
        } else {
            Object.keys(playerMap).forEach(playerId => {
                if (!playerMap[playerId]) {
                    playerMap[Number(playerId)] = [];
                }
                if (node.node.asset) {
                    const assetInfo = this.gameAssets[Object.keys(node.node.asset)[0]]?.info;
                    if (assetInfo.type === 'audio' && this.playerSettings[playerId]?.SOUND && !this.playerSettings[playerId].SOUND.enabled) {
                    } else {
                        playerMap[playerId].push(squished);
                    }
                } else {
                    playerMap[playerId].push(squished);
                }
            })
        }

        for (let i = 0; i < node.node.children.length; i++) {
//            if (node.node.children[i].node.playerIds
            // make a new set so child calls within a single generation arent 
            // modifying the same filter set
            const pathFilter = new Set(playerIdFilter);
            this.squishHelper(node.node.children[i], squishedNodes, scale, playerMap, pathFilter);
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
        if (this.listeners.size > 0) {
            this.state = this.squish(this.game.getLayers());
            this.broadcast();
        }
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
