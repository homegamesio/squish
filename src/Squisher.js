const ASSET_TYPE = 1;

const { squish, unsquish } = require('./squish');

const INVISIBLE_PLAYER_ID = 0;

class Squisher {
    constructor({ game, scale, customBottomLayer, customTopLayer }) {
        this.ids = new Set();

        this.game = game;

        this.customBottomLayer = customBottomLayer;
        this.customTopLayer = customTopLayer;

        // performance optimization by only updating layer???
        // for (const layerIndex in game.layers) {
        //     const layerRoot = game.layers[layerIndex].root;
        //     const realListener = this.handleStateChange.bind(this);
        //     layerRoot.addListener({
        //         handleStateChange: (node) => {
        //             realListener(node, layerIndex);
        //         }
        //     });
        // }

        this.listeners = new Set();
        this.scale = scale || {x: 1, y: 1};
        this.state = this.squish(this.game.getLayers());
        this.spectatorState = this.game.getSpectatorLayers ? this.squish(this.game.getSpectatorLayers()) : [];
        this.assets = {};
        // if (this.game.tick) {
        //     const tickRate = this.gameMetadata && this.gameMetadata.tickRate ? this.gameMetadata.tickRate : DEFAULT_TICK_RATE;
        //     setInterval(this.game.tick.bind(this.game), 1000 / tickRate);
        // }
    }

    addListener(onEvent) {
        const listener = {
            onEvent,
            remove: () => this.removeListener(listener)
        };

        this.listeners.add(listener);
    }

    removeListener(listener) {
    }

    unsquish(node) {
        return unsquish(node);
    }
 
    // addListener(listener) {
    //     this.listeners.add(listener);
    // }

    // removeListener(listener) {
    //     this.listeners.remove(listener);
    // }

    // getPlayerIds(node, ids) {
    //     for (const i in node.node.playerIds) {
    //         if (node.node.playerIds[i] !== 0) {
    //             ids.add(node.node.playerIds[i]);
    //         }
    //     }

    //     for (let i = 0; i < node.node.children.length; i++) {
    //         this.getPlayerIds(node.node.children[i], ids);
    //     }
    // }

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

        return toSquish.flat(); //flat ? squishedLayers.flat() : squishedLayers;
        // for (const playerId in playerFrames) {
        //     playerFrames[playerId] = playerFrames[playerId].flat();
        // }
        // for (const spectatorId in spectatorFrames) {
        //     spectatorFrames[spectatorId] = spectatorFrames[spectatorId].flat();
        // }
        // this.spectatorFrames = spectatorFrames;
        // this.playerFrames = Object.assign(playerFrames, spectatorFrames);//playerFrames;

        // return this.playerFrames;
    }

    squishHelper(node, squishedNodes, scale = {x: 1, y: 1}, playerMap = {}) {// playerFrames, spectatorFrames, whitelist, scale, spectatorFrameId) {
        // const scale = {x: .9, y: .9};
        // const yScale = 1;//PERFORMANCE_PROFILING ? .8 : 1;
        // if (this.game.getRoot() === node) {
        //     scale = {
        //         x: 1,
        //         y: 1
        //         // x: (100 - BEZEL_SIZE_X) / 100,
        //         // y: yScale * ((100 - BEZEL_SIZE_Y) / 100)
        //     };
        // }
       // else if (this.hgRoot.getRoot() == node || this.hgRoot.baseThing == node) {
       //     scale = {
       //         x: 1,//(100 - BEZEL_SIZE_X) / 100,
       //         y: yScale * 1//(100 - BEZEL_SIZE_Y - 20) / 100
       //     }
       // } else if (this.hgRoot.perfThing == node) {
       //     scale = {
       //         x: 1,
       //         y: 1
       //     }
       // }

       // terrible
        if (!this.ids.has(node.node.id) || !node.node.listeners.has(this)) {
            // console.log("need to do this");
            this.ids.add(node.node.id);
            node.addListener(this);
        }

        // console.log(node.node.playerIds.findIndex((i) => i=== INVISIBLE_PLAYER_ID))
        if (node.node.playerIds.findIndex((id) => id === INVISIBLE_PLAYER_ID) > -1) {
        } else {
            const squished = squish(node, scale);
            squishedNodes.push(squished);

            if (playerMap) {
                if (node.node.playerIds && node.node.playerIds.length) {
                    node.node.playerIds.forEach(playerId => {
                        // console.log("NEED TO BUILD PLAYER MAP");
                        // console.log(playerId);
                        if (playerMap[playerId]) {
                            playerMap[playerId].push(squished);
                            // console.log(playerMap);
                            // playerMap[playerId] = [];
                        } else {
                            console.warn(`Node references unknown player ID: ${playerId}`);
                        }
                        // playerMap[playerId].push(squished);
                    });
                } else {
                    Object.keys(playerMap).forEach(playerId => {
                        playerMap[playerId].push(squished);
                    })
                }
            }
        }

        // for (const i in node.node.playerIds) {
        //     whitelist.add(node.node.playerIds[i]);
        // }

        // const nodeIsInvisible = node.node.playerIds.length > 0 && 
        //     node.node.playerIds[0] === INVISIBLE_NODE_PLAYER_ID;

        // // public node
        // if (node.node.playerIds.length === 0 && whitelist.size == 0) {
        //     for (const playerId in playerFrames) {
        //         playerFrames[playerId].push(squished);
        //     }

        //     for (const spectatorId in spectatorFrames) {
        //         spectatorFrames[spectatorId].push(squished);
        //     }
        // } else if (!nodeIsInvisible && !(whitelist.has(INVISIBLE_NODE_PLAYER_ID))) {
        //     for (const playerId of whitelist) {
        //         if (playerId === spectatorFrameId) {
        //             for (const spectatorId in spectatorFrames) {
        //                 spectatorFrames[spectatorId].push(squished);
        //             }
        //         } else if (spectatorFrames[playerId]) {
        //             spectatorFrames[playerId].push(squished);
        //         } else if (!playerFrames[playerId]) {
        //             console.warn('got frame for unknown player ' + playerId);
        //         } else {
        //             playerFrames[playerId].push(squished);
        //         }
        //     }
        // }

        for (let i = 0; i < node.node.children.length; i++) {
            this.squishHelper(node.node.children[i], squishedNodes, scale, playerMap); // playerFrames, spectatorFrames, whitelist, scale, spectatorFrameId);
        }

        // for (const i in node.node.playerIds) {
        //     whitelist.delete(node.node.playerIds[i]);
        // }

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
        // console.log("something changed on this layer");
        // console.log(node);
        // console.log(layerName);
        this.state = this.squish(this.game.getLayers());
        this.broadcast();
    }

    broadcast() {
        for (const listener of this.listeners) {
            listener.onEvent(this.state);
        }
    }
//        if (PERFORMANCE_PROFILING) {
//            this.hgRoot.handleSquisherMessage({
//                type: 'renderStart',
//                time: Date.now()
//            });
//        }

//        const playerFrames = this.update(this.hgRoot.getRoot());

//        for (const listener of this.listeners) {
//            listener.handleSquisherUpdate(playerFrames);
//        }
//
//        if (PERFORMANCE_PROFILING) {
//            this.hgRoot.handleSquisherMessage({
//                type: 'renderEnd',
//                time: Date.now()
//            });
//        }
//    }
}

module.exports = Squisher;
