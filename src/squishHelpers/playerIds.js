const PLAYER_ID_SUBTYPE = 44;

const squishPlayerIds = {
	type: PLAYER_ID_SUBTYPE,
	squish: (i) => i,
	unsquish: (squished) => squished
}

module.exports = {
    PLAYER_ID_SUBTYPE,
    squishPlayerIds
};