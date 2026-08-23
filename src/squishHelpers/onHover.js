// 42-55 are taken (55 = subType, whose const is named SUBTYPE_TYPE — easy to
// miss when scanning for free bytes).
const ONHOVER_SUBTYPE = 56;

// Serializes only the PRESENCE of a hover handler (like handleClick) so the
// client knows to send onhover/offhover events for this node. offHover isn't
// serialized — like offClick, the leave event is routed by the session to
// whatever handler the node has.
const squishOnHover = {
	type: ONHOVER_SUBTYPE,
	squish: (a) => {
		return a ? [1] : [0];
	},
	unsquish: (a) => {
		return a[0] === 1;
	}
}

module.exports = {
    ONHOVER_SUBTYPE,
    squishOnHover
};
