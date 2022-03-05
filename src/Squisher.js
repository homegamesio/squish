const ASSET_TYPE = 1;

const { squish, unsquish } = require('./squish');

const INVISIBLE_PLAYER_ID = 0;
const DEFAULT_TICK_RATE = 60;

class Squisher {
    constructor({ game, scale, customBottomLayer, customTopLayer }) {
        this.ids = new Set();

        this.game = game;

        this.customBottomLayer = customBottomLayer;
        this.customTopLayer = customTopLayer;

        this.listeners = new Set();
        this.scale = scale || {x: 1, y: 1};
        this.state = this.squish(this.game.getLayers());
        this.spectatorState = this.game.getSpectatorLayers ? this.squish(this.game.getSpectatorLayers()) : [];
        this.assets = {};
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
        Object.keys(this.game.players).forEach(playerId => {
            playerMap[Number(playerId)] = [];
        });

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

        // todo: remove/move this side effect
        this.playerStates = playerMap;

        return toSquish.flat();
    }

    squishHelper(node, squishedNodes, scale = {x: 1, y: 1}, playerMap = {}) {
        if (!node.node.listeners.has(this)) {
            node.addListener(this);
        }

        const squished = squish(node, scale);
        squishedNodes.push(squished);

        if (playerMap) {
            if (node.node.playerIds && node.node.playerIds.length) {
                node.node.playerIds.forEach(playerId => {
                    if (playerMap[playerId]) {
                        playerMap[playerId].push(squished);
                    } else {
                        console.warn(`Node references unknown player ID: ${playerId}`);
                    }
                });
            } else {
                Object.keys(playerMap).forEach(playerId => {
                    playerMap[playerId].push(squished);
                })
            }
        }

        for (let i = 0; i < node.node.children.length; i++) {
            this.squishHelper(node.node.children[i], squishedNodes, scale, playerMap);
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

            if (this.customBottomLayer && this.customBottomLayer.assets) {
                Object.assign(gameAssets, this.customBottomLayer.assets);
            }
            
            if (this.customTopLayer && this.customTopLayer.assets) {
                Object.assign(gameAssets, this.customTopLayer.assets);
            }

            if (this.game.getAssets && this.game.getAssets()) {
                Object.assign(gameAssets, this.game.getAssets());
            }
            
            const initializeAssetBundle = () => new Promise((resolve, reject) => {
                let assetBundleSize = 0;
                let finishedCount = 0;
                const totalCount = Object.keys(gameAssets).length;
    
                for (const key in gameAssets) {
                    gameAssets[key].getData().then(buf => {
                        const assetKeyLength = 32;
                        let keyIndex = 0;
                        const assetKeyArray = new Array(32);
                        while (keyIndex < assetKeyLength && keyIndex < key.length) {
                            assetKeyArray[keyIndex] = key.charCodeAt(keyIndex);
                            keyIndex++;
                        }
    
                        const encodedLength = (buf.length + assetKeyLength).toString(36);
                        
                        const assetType = gameAssets[key].info.type === 'image' ? 1 : 2;
    
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
                            resolve(newAssetBundle); 
                        }
                    });
                }
            });

            initializeAssetBundle().then((newAssetBundle) => {
                this.assetBundle = newAssetBundle;
                resolve();
            });

        });
    }

    handleStateChange(node, layerName) {
        this.state = this.squish(this.game.getLayers());
        this.broadcast();
    }

    broadcast() {
        for (const listener of this.listeners) {
            listener.onEvent(this.state);
        }
    }

}

module.exports = Squisher;
