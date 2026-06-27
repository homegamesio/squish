const { getFractional } = require('../util');

const ASSET_SUBTYPE = 48;

const squishAsset = {
	type: ASSET_SUBTYPE,
	squish: (a, scale) => {
		const assetKey = Object.keys(a)[0];
		const squishedAssets = new Array(18 + assetKey.length);

		const asset = a[assetKey];

		const posX = scale ? ((scale.x * asset.pos.x) + Math.round(100 * (1 - scale.x)) / 2) : asset.pos.x;
		const posY = scale ? ((scale.y * asset.pos.y) + Math.round(100 * (1 - scale.y)) / 2) : asset.pos.y;

		const sizeX = scale ? scale.x * asset.size.x : asset.size.x;
		const sizeY = scale ? scale.y * asset.size.y : asset.size.y;

		const startTimeSecond = asset.startTime || 0;

		// Crop values are percentages (0-100) of the source image, expressed as
		// the amount removed from each edge. They sample a sub-region of the
		// source and are independent of layer scale (which affects pos/size, i.e.
		// where the cropped region lands on screen). Default to 0 (no crop).
		const cropLeft = asset.cropLeft || 0;
		const cropTop = asset.cropTop || 0;
		const cropRight = asset.cropRight || 0;
		const cropBottom = asset.cropBottom || 0;

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

		squishedAssets[10] = Math.floor(cropLeft);
		squishedAssets[11] = getFractional(cropLeft);

		squishedAssets[12] = Math.floor(cropTop);
		squishedAssets[13] = getFractional(cropTop);

		squishedAssets[14] = Math.floor(cropRight);
		squishedAssets[15] = getFractional(cropRight);

		squishedAssets[16] = Math.floor(cropBottom);
		squishedAssets[17] = getFractional(cropBottom);

		for (let i = 0; i < assetKey.length; i++) {
			squishedAssets[18 + i] = assetKey.codePointAt(i);
		}

		return squishedAssets;
	},
	unsquish: (squished) => {
		const assetPosX = squished[0] + squished[1] / 100;
		const assetPosY = squished[2] + squished[3] / 100;

		const assetSizeX = squished[4] + squished[5] / 100;
		const assetSizeY = squished[6] + squished[7] / 100;

		const startTime = squished[8] + squished[9] / 100;

		const cropLeft = squished[10] + squished[11] / 100;
		const cropTop = squished[12] + squished[13] / 100;
		const cropRight = squished[14] + squished[15] / 100;
		const cropBottom = squished[16] + squished[17] / 100;

		const assetKey = String.fromCodePoint.apply(null, squished.slice(18));

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
				startTime,
				cropLeft,
				cropTop,
				cropRight,
				cropBottom
			}
		}
	}
}

module.exports = {
    ASSET_SUBTYPE,
    squishAsset
};
