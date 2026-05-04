const ASSET_TYPE = 1;

const { squish, unsquish } = require('./squish');

const INVISIBLE_PLAYER_ID = 0;
const DEFAULT_TICK_RATE = 60;

class Squisher {
    constructor({ game, scale, customBottomLayer, customTopLayer, onAssetUpdate }) {
        this.ids = new Set();

        this.game = game;
        this.gameMetadata = game.constructor.metadata && game.constructor.metadata();
        this.assets = {};
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

        // Push all squished nodes into a single flat array — eliminates
        // the per-layer arrays and the final toSquish.flat() allocation.
        const allSquished = [];
        const playerMap = {};

        if (this.customBottomLayer) {
            this.squishHelper(this.customBottomLayer.root, allSquished, this.customBottomLayer.scale, playerMap);
        }
        
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            const layerInfo = layers[layerIndex];
            
            const layerScale = layerInfo.scale ? {
                x: this.scale.x * layerInfo.scale.x,
                y: this.scale.y * layerInfo.scale.y
            } : this.scale;

            this.squishHelper(layerInfo.root, allSquished, scale || layerScale, playerMap);
        }

        if (this.customTopLayer) {            
            this.squishHelper(this.customTopLayer.root, allSquished, this.customTopLayer.scale, playerMap);
        }

        this.playerFrames = playerMap;

        return allSquished;
    }

    getPlayerFrame(playerId) {
        return this.playerFrames[playerId];
    }

    handleNewAsset(key, asset) {
        return this.initialize();
    }

    // Use an array instead of Set for playerIdFilter to avoid allocations.
    // Arrays with small counts (typical: 1-4 players) are faster than Sets
    // for contains checks and don't need 'new Set()' per child.
    squishHelper(node, squishedNodes, scale = {x: 1, y: 1}, playerMap = {}, playerIdFilter = null) {
        if (!node.node.listeners.has(this)) {
            node.addListener(this);
        }

        const squished = squish(node, scale);
        squishedNodes.push(squished);

        // Build the filter array for this node.
        // Use null to represent "no filter" (empty).
        let filter = playerIdFilter;

        if (node.node.playerIds && node.node.playerIds.length > 0) {
            // Copy-on-write: only allocate a new array when we actually
            // need to add IDs that aren't already in the filter
            const nodeIds = node.node.playerIds;
            for (let pi = 0; pi < nodeIds.length; pi++) {
                const pId = nodeIds[pi];
                if (filter === null) {
                    filter = [pId];
                } else if (filter.indexOf(pId) < 0) {
                    // If filter is the same reference as our parent's,
                    // copy before mutating so siblings aren't affected
                    if (filter === playerIdFilter) {
                        filter = filter.slice();
                    }
                    filter.push(pId);
                }
            }
        }

        if (filter !== null && filter.length > 0) {
            // Track which IDs to remove after iteration (avoid allocating
            // a removal set — just collect indices to splice)
            let removeCount = 0;

            for (let fi = 0; fi < filter.length; fi++) {
                const playerId = filter[fi];
                if (!playerMap[playerId]) {
                    playerMap[Number(playerId)] = [];
                } 

                if (node.node.playerIds.length === 0 || node.node.playerIds.indexOf(Number(playerId)) >= 0) {
                    playerMap[playerId].push(squished);
                } else {
                    // Mark for removal by setting to a sentinel.
                    // We compact afterwards to avoid splice overhead inside the loop.
                    filter[fi] = -1;
                    removeCount++;
                }
            }
            if (removeCount > 0) {
                // Ensure we own this array before mutating
                if (filter === playerIdFilter) {
                    filter = filter.slice();
                }
                // Compact: remove -1 sentinels
                let writeIdx = 0;
                for (let ri = 0; ri < filter.length; ri++) {
                    if (filter[ri] !== -1) {
                        filter[writeIdx++] = filter[ri];
                    }
                }
                filter.length = writeIdx;
            }
        } else {
            const playerMapKeys = Object.keys(playerMap);
            for (let ki = 0; ki < playerMapKeys.length; ki++) {
                const playerId = playerMapKeys[ki];
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
            }
        }

        const children = node.node.children;
        for (let i = 0; i < children.length; i++) {
            // Pass filter directly — child will copy-on-write if it needs
            // to add new IDs, so siblings aren't affected.
            this.squishHelper(children[i], squishedNodes, scale, playerMap, filter);
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
                const assets = Object.assign({}, this.assets || {});

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

                const allAssets = Object.assign(assets, gameAssets);

                let finishedCount = 0;
                const totalCount = Object.keys(allAssets).length;

                if (totalCount === 0) {
                    this.assetBundle = Buffer.alloc(0);
                    resolve(this.assetBundle);
                    return;
                }

                for (const key in allAssets) {
                    allAssets[key].getData().then(buf => {
                        const assetKeyLength = 32;
                        const assetKeyBuf = Buffer.alloc(assetKeyLength);
                        for (let i = 0; i < assetKeyLength && i < key.length; i++) {
                            assetKeyBuf[i] = key.charCodeAt(i);
                        }

                        const encodedLength = (buf.length + assetKeyLength).toString(36);

                        const assetTypeMap = {
                            'image': 1,
                            'audio': 2,
                            'font': 3
                        };

                        const assetType = assetTypeMap[allAssets[key].info.type];

                        const encodedMaxLength = 10;
                        const encodedLengthBuf = Buffer.alloc(encodedMaxLength);
                        for (let i = 0; i < encodedMaxLength; i++) {
                            encodedLengthBuf[i] = i < encodedLength.length ? encodedLength.charCodeAt(i) : 0;
                        }

                        const header = Buffer.from([ASSET_TYPE, assetType]);
                        this.assets[key] = Buffer.concat([header, encodedLengthBuf, assetKeyBuf, buf]);
                        finishedCount += 1;

                        if (finishedCount == totalCount) {
                            const buffers = [];
                            for (const key in this.assets) {
                                buffers.push(this.assets[key]);
                            }
                            this.assetBundle = Buffer.concat(buffers);
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
