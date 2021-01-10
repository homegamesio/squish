const hypLength = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

// get the first 2 digits after the decimal
const getFractional = (number) => {
    return Math.round(100 * (number - Math.floor(number)));
};

module.exports = {
    hypLength,
    getFractional
};
