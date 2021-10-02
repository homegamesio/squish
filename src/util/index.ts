export const hypLength = (x: number, y: number) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

// get the first 2 digits after the decimal
export const getFractional = (number: number) => {
    return Math.round(100 * (number - Math.floor(number)));
};
