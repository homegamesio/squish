const { getFractional } = require('../util')

const ASSET_SUBTYPE = 48;

const squishAsset = {
	type: ASSET_SUBTYPE,
	squish: (a, scale) => {
		const assetKey = Object.keys(a)[0];
		const squishedAssets = new Array(10 + assetKey.length);

		const asset = a[assetKey];

		const posX = scale ? ((scale.x * asset.pos.x) + Math.round(100 * (1 - scale.x)) / 2) : asset.pos.x;
		const posY = scale ? ((scale.y * asset.pos.y) + Math.round(100 * (1 - scale.y)) / 2) : asset.pos.y;

		const sizeX = scale ? scale.x * asset.size.x : asset.size.x;
		const sizeY = scale ? scale.y * asset.size.y : asset.size.y;

		const startTimeSecond = asset.startTime || 0;

		squishedAssets[0] = Math.floor(posX);
		squishedAssets[1] = getFractional(posX);

		squishedAssets[2] = Math.floor(posY);
		squishedAssets[3] = getFractional(posY);

		squishedAssets[4] = Math.floor(sizeX);
		squishedAssets[5] = getFractional(sizeX);

		squishedAssets[6] = Math.floor(sizeY);
		squishedAssets[7] = getFractional(sizeY);

		squishedAssets[8] = Math.floor(startTimeSecond);
		squishedAssets[9] = getFractional(startTimeSecond);

		for (let i = 0; i < assetKey.length; i++) {
			squishedAssets[10 + i] = assetKey.codePointAt(i);
		}

		return squishedAssets;
	},
	unsquish: (squished) => {
		const assetPosX = squished[0] + squished[1] / 100;
		const assetPosY = squished[2] + squished[3] / 100;

		const assetSizeX = squished[4] + squished[5] / 100;
		const assetSizeY = squished[6] + squished[7] / 100;

		const startTime = squished[8] + squished[9] / 100;

		const assetKey = String.fromCodePoint.apply(null, squished.slice(10));

		return {
			[assetKey]: {
				pos: {
					x: assetPosX,
					y: assetPosY
				},
				size: {
					x: assetSizeX,
					y: assetSizeY
				},
				startTime
			}
		}
	}
}

module.exports = {
    ASSET_SUBTYPE,
    squishAsset
};