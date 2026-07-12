const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const { getAppDataPath } = require('./utils');

// assets is the old stuff, save it for backward compatibility
let _assetUrl = 'https://assets.homegames.io';

// dumb. probably a way to get around needing to do this in shared library between client and server
try {
    _assetUrl = process?.env?.API_URL ? `${process.env.API_URL}/assets`: 'https://api.homegames.io/assets';
} catch (err) {
    console.log('probably running in a browser');
    console.error(err);
}

const ASSET_URL = _assetUrl;

class Asset {
    constructor(info, data = null) {
        this.info = info;
        if (data) {
            this.data = data;
        }
    }

    getConfigValue(key, _default = undefined) {
        const config = this.getConfig();

        let envValue = process.env[key] && `${process.env[key]}`;
        if (envValue !== undefined) {
            if (envValue === 'true') {
                envValue = true;
            } else if (envValue === 'false') {
                envValue = false;
            }
            console.log(`Using environment value: ${envValue} for key: ${key}`);
            return envValue;
        }
            if (config[key] === undefined && _default === undefined) {
                throw new Error(`No value for ${key} found in config`);
            } else if (config[key] === undefined && _default !== undefined) {
                return _default;
            }
            console.log(`Found value ${config[key]} in config`);
            return config[key];
    };

    getConfig() {

        if (this.cachedConfig) {
            return this.cachedConfig;
        }

        const options = [process.cwd(), require.main.filename, process.mainModule.filename, __dirname]
        let _config = {};
        
        for (let i = 0; i < options.length; i++) {
            if (fs.existsSync(`${options[i]}/config.json`)) {
                console.log(`Using config at ${options[i]}`);
                _config = JSON.parse(fs.readFileSync(`${options[i]}/config.json`));
                break;
            }
        }

        this.cachedConfig = _config;

        return _config;
    }


    getHash(str) {
        const shasum = crypto.createHash('sha1');
        shasum.update(str);
        return shasum.digest('hex');
    };

    getFileLocation() {
        const fileHash = this.getHash(this.info.id);
        const HG_ASSET_PATH = path.join(getAppDataPath(), 'asset-cache');
        return `${HG_ASSET_PATH}/${fileHash}`;
    }

    existsLocallySync() {
        const fileLocation = this.getFileLocation(this.info.id);
        return fs.existsSync(fileLocation);
    }
    
    existsLocally() {
        return new Promise((resolve, reject) => {
            if (this.data) {
                return resolve(true);
            }
            const fileLocation = this.getFileLocation(this.info.id);
            fs.exists(fileLocation, (exists) => {
                resolve(exists && fileLocation);
            });
        });
    }

    async downloadSync(force) {
        const HG_ASSET_PATH = path.join(getAppDataPath(), 'asset-cache');
        if (!fs.existsSync(HG_ASSET_PATH)) {
            fs.mkdirSync(HG_ASSET_PATH);
        }
        const fileLocationExists = this.existsLocallySync();
        const fileLocation = this.getFileLocation(this.info.id);

        if (fileLocationExists && !force) {
            this.initialized = true;
            return fileLocation;
        } else {
            const fileLocation2 = await downloadFileSync(this.info.id, HG_ASSET_PATH);
            this.initialized = true;
            return fileLocation2;
        }
    }
    
    download(force) {
        const HG_ASSET_PATH = path.join(getAppDataPath(), 'asset-cache');
        if (!fs.existsSync(HG_ASSET_PATH)) {
            fs.mkdirSync(HG_ASSET_PATH);
        }
        return new Promise((resolve, reject) => {
            this.existsLocally().then(fileLocation => {
                if (fileLocation && !force) {
                    this.initialized = true;
                    resolve(fileLocation);
                } else {
                    this.doDownload(this.info.id, HG_ASSET_PATH).then((fileLocation) => {
                        this.initialized = true;
                        resolve(fileLocation);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        });
    }

    getData() {
        return new Promise((resolve, reject) => {
            if (this.data) {
                resolve(this.data);
            } else {
                this.download().then(fileLocation => {
                    fs.readFile(fileLocation, (err, buf) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(buf);
                        }
                    });
                }).catch(err => {
                    reject(err);
                });
            }
        }); 
    }
    
    doDownload(assetId, assetPath) {
        return new Promise((resolve, reject) => {
            const fileHash = this.getHash(assetId);
            const filePath = `${assetPath}/${fileHash}`;

            const getModule = ASSET_URL.startsWith('https') ? https : http;

            getModule.get(`${ASSET_URL}/${assetId}`, (res) => {
                if (res.statusCode !== 200) {
                    res.resume();
                    reject('Bad response when downloading asset');
                    return;
                }

                // Only open the cache file once we know the response is good —
                // otherwise a failed download leaves a zero-byte file behind
                // that reads back as a valid cache hit forever after.
                const writeStream = fs.createWriteStream(filePath);

                writeStream.on('close', () => {
                    resolve(filePath);
                });

                writeStream.on('error', (error) => {
                    fs.unlink(filePath, () => reject(error));
                });

                res.on('error', (error) => {
                    writeStream.destroy();
                    fs.unlink(filePath, () => reject(error));
                });

                res.pipe(writeStream);
            }).on('error', error => {
                console.error('Failed to download asset');
                console.error(error);
                reject(error);
            });
        });
    }

}

module.exports = Asset;

