const EFFECTS_SUBTYPE = 49;

const squishEffect = {
	type: EFFECTS_SUBTYPE,
	squish: (a) => {
		if (a['shadow']) {
			const assetKey = 'shadow';
			let squishedLength = assetKey.length + 4; // + 4 for color
			if (a['shadow'].blur) {
				squishedLength += 2;
			}
			const squishedEffects = new Array(squishedLength);
			for (let i = 0; i < assetKey.length; i++) {
				squishedEffects[i] = assetKey.codePointAt(i);
			}
			squishedEffects[assetKey.length] = a.shadow.color[0];
			squishedEffects[assetKey.length + 1] = a.shadow.color[1];
			squishedEffects[assetKey.length + 2] = a.shadow.color[2];
			squishedEffects[assetKey.length + 3] = a.shadow.color[3];

			if (a.shadow.blur) {
				squishedEffects[assetKey.length + 4] = Math.floor(a.shadow.blur / 10)
				squishedEffects[assetKey.length + 5] = a.shadow.blur % 10
			}

			return squishedEffects;
		}
	},
	unsquish: (squished) => {
		// 'shadow' is all (for now)
		const assetKey = String.fromCodePoint.apply(null, squished.slice(0, 6));
		const color = squished.slice(6, 10);
		let blur;
		if (squished.length > 10) {
			blur = squished[10] * 10 + squished[11];
		}

		const unsquished = {
			[assetKey]: {
				color
			}
		};

		if (blur) {
			unsquished[assetKey].blur = blur;
		}

		return unsquished;
	}
}

module.exports = {
    EFFECTS_SUBTYPE,
    squishEffect
};