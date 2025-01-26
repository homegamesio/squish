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
        this.listeners.remove(listener);
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
        return new Promise((resolve, reject) => {
            this.initialize().then(resolve);
        });
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

                let assetBundleSize = 0;
                let finishedCount = 0;
                const totalCount = Object.keys(allAssets).length;
    
                for (const key in allAssets) {
                    allAssets[key].getData().then(buf => {
                        const assetKeyLength = 32;
                        let keyIndex = 0;
                        const assetKeyArray = new Array(32);
                        while (keyIndex < assetKeyLength && keyIndex < key.length) {
                            assetKeyArray[keyIndex] = key.charCodeAt(keyIndex);
                            keyIndex++;
                        }
    
                        const encodedLength = (buf.length + assetKeyLength).toString(36);
                        
                        const assetTypeMap = {
                            'image': 1,
                            'audio': 2,
                            'font': 3
                        };
   
                        const assetType = assetTypeMap[allAssets[key].info.type];
    
                        const encodedMaxLength = 10;
                        let encodedLengthString = '';
                        for (let i = 0; i < (encodedMaxLength - encodedLength.length); i++) {
                            encodedLengthString += '0';
                        }
                        for (let j = encodedLength.length; j < encodedMaxLength; j++) {
                            encodedLengthString +=  encodedLength.charAt(j - encodedLength.length);
                        }
                        const encodedLengthArray = new Array(encodedMaxLength);
                        for (let i = 0; i < encodedMaxLength; i++) {
                            encodedLengthArray[i] = encodedLength.charCodeAt(i);
                        }
    
                        this.assets[key] = [ASSET_TYPE, assetType, ...encodedLengthArray, ...assetKeyArray, ...buf];
                        assetBundleSize += this.assets[key].length;
                        finishedCount += 1;

                        if (finishedCount == totalCount) {
                            const newAssetBundle = new Array(assetBundleSize);
                            for (let index = 0; index < assetBundleSize; index++) {
                                for (const key in this.assets) {
                                    for (let y = 0; y < this.assets[key].length; y++) {
                                        newAssetBundle[index++] = this.assets[key][y];
                                    }
                                }
                            }
                            this.assetBundle = newAssetBundle;
                            resolve(newAssetBundle);
                        }
                    }).catch(err => {
                        console.error('Unable to get asset data for key ' + key);
                        console.error(err);
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
