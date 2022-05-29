const ASSET_TYPE = 1;

const { squish, unsquish } = require('./squish');

const INVISIBLE_PLAYER_ID = 0;
const DEFAULT_TICK_RATE = 60;

class Squisher {
    constructor({ game, scale, customBottomLayer, customTopLayer, onAssetUpdate }) {
        this.ids = new Set();

        this.game = game;
        this.assets = {};

        this.customBottomLayer = customBottomLayer;
        this.customTopLayer = customTopLayer;

        this.initialize();
        this.onAssetUpdate = onAssetUpdate;

        this.playerFrames = {};

        this.listeners = new Set();
        this.scale = scale || {x: 1, y: 1};
        this.state = this.squish(this.game.getLayers());
        // this.spectatorState = this.game.getSpectatorLayers ? this.squish(this.game.getSpectatorLayers()) : [];
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

    async handleNewAsset(key, asset) {
        console.log('this is the asset you want');
        console.log(asset);
        console.log('this is my (adding ' + key);
        await this.initialize();
        // console.log(this.assets);
        // this.assets[key] = asset;
    }

    squishHelper(node, squishedNodes, scale = {x: 1, y: 1}, playerMap = {}, playerIdFilter = new Set()) {
        if (!node.node.listeners.has(this)) {
            node.addListener(this);
        }

        // console.log('whattheh ff');
        // console.log(this.assets);

        // if (node.node.asset) {
        //     // console.log('what is asset?? ');
        //     // console.log(node.node.asset);
        //     for (const key in node.node.asset) {
        //         if (!this.assets[key]) {
        //             console.log('need to tell the person about asset with key ' + key);
        //             this.initialize();
        //             console.log("AND NOW PLS " + key);
        //             console.log(this.assets[key]);
        //             // console.log('the fuck? key is ' + key);
        //             // console.log(node.node);
        //             // console.log('key for asset is ' + key + ' and the thumbnail is ' + node.node.asset[key].metadata.thumbnail);
        //             // this.assets[key] = node.node.asset[key];
        //             // this.initialize()//.then((newAssetBundle) => {
        //                 // console.log('got new assss');
        //                 // console.log("THIS ASSETS NOW");
        //                 // console.log(this.assets);
        //                 // this.onAssetUpdate && this.onAssetUpdate(this.assetBundle);
        //             // }//)
        //             // console.log('i dont know this asset. need to tell session about it ' + key);
        //         }
        //     }
        // }

        const squished = squish(node, scale);
        squishedNodes.push(squished);

        if (node.node.playerIds && node.node.playerIds.length > 0) {
            node.node.playerIds.forEach(pId => playerIdFilter.add(pId));
        }

        if (playerIdFilter.size > 0) {
            for (let playerId of playerIdFilter) {
                if (!playerMap[playerId]) {
                    playerMap[Number(playerId)] = [];
                } 

                playerMap[playerId].push(squished);
            }
        } else {
            Object.keys(playerMap).forEach(playerId => {
                if (!playerMap[playerId]) {
                    playerMap[Number(playerId)] = [];
                }
                playerMap[playerId].push(squished);
            })
        }

        for (let i = 0; i < node.node.children.length; i++) {
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

    async initialize() {
        // return new Promise((resolve, reject) => {
             
            // this.initializeAssetBundle = () => {

                const assets = Object.assign({}, this.assets || {});

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

                const allAssets = Object.assign(assets, gameAssets);
                // console.log('game asset kjeys');
                // console.log(Object.keys(gameAssets));
                // if (gameAssets['4b1a7ddf524b7b6d78fbaa2e5cf48507']) {
                //     console.log('game asset');
                //     console.log(gameAssets['4b1a7ddf524b7b6d78fbaa2e5cf48507']);
                // }
                let assetBundleSize = 0;
                let finishedCount = 0;
                const totalCount = Object.keys(allAssets).length;
    
                for (const key in allAssets) {
                    const buf = await allAssets[key].getDataSync();//.then(buf => {
                        // console.log("buf!!");
                        // console.log(buf);
                        const assetKeyLength = 32;
                        let keyIndex = 0;
                        const assetKeyArray = new Array(32);
                        while (keyIndex < assetKeyLength && keyIndex < key.length) {
                            assetKeyArray[keyIndex] = key.charCodeAt(keyIndex);
                            keyIndex++;
                        }
    
                        const encodedLength = (buf.length + assetKeyLength).toString(36);
                        
                        const assetType = allAssets[key].info.type === 'image' ? 1 : 2;
    
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
                        // finishedCount += 1;

                        // if (finishedCount == totalCount) {
                        //     const newAssetBundle = new Array(assetBundleSize);
                        //     for (let index = 0; index < assetBundleSize; index++) {
                        //         for (const key in this.assets) {
                        //             console.log('ayo going through assets ' + key);
                        //             // console.log()
                        //             for (let y = 0; y < this.assets[key].length; y++) {
                        //                 newAssetBundle[index++] = this.assets[key][y];
                        //             }
                        //         }
                        //     }
                        //     console.log('just set asset bundle to this');
                        //     console.log(newAssetBundle);
                        //     this.assetBundle = newAssetBundle;
                        //     return;
                        // }
                    //}//);
                }

                // console.log('okay so this assets ' + assetBundleSize);
                // console.log(this.assets);
                 const newAssetBundle = new Array(assetBundleSize);
                    for (let index = 0; index < assetBundleSize; index++) {
                        for (const key in this.assets) {
                            console.log('ayo going through assets ' + key);
                            // if (key == '4906be140eb4f89f47e27c7dfc7d66e8') {
                            //     console.log('what is tdfgs');
                            //     console.log(this.assets[key]);
                            // }
                            // console.log()
                            for (let y = 0; y < this.assets[key].length; y++) {
                                newAssetBundle[index++] = this.assets[key][y];
                            }
                        }
                    }
                    // console.log('just set asset bundle to this');
                    // console.log(newAssetBundle);
                    this.assetBundle = newAssetBundle;
            // }

            // this.initializeAssetBundle().then((newAssetBundle) => {
            //     this.assetBundle = newAssetBundle;
            //     resolve();
            // });

        // });
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
