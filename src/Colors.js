const COLORS = {
    ALMOST_BLACK: [16, 16, 16, 255],
    ALMOST_WHITE: [238, 238, 238, 255],
    ANTIQUE_WHITE: [250, 235, 215, 255],
    AQUA: [188, 212, 230, 255],
    AQUAMARINE: [127, 255, 212, 255],
    BEIGE: [245, 245, 220, 255],
    BIG_GRAY: [221, 221, 221, 255],
    BLACK: [0, 0, 0, 255],
    BLAY: [87, 102, 117, 255],
    BLUE: [0, 0, 255, 255],
    BLUE_WHISPER: [240, 248, 255, 255],
    BLEEN: [19, 51, 55, 255],
    BLOOD: [153, 0, 0, 255],
    BOOGER: [186, 218, 85, 255],
    BRIGHT_GRAY: [198, 226, 255, 255],
    BRONZE: [227, 151, 17, 255],
    BROWN: [145, 97, 11, 255],
    CANDY_GREEN: [90, 193, 142, 255],
    CANDY_PINK: [255, 115, 115, 255],
    CANDY_RED: [246, 84, 106, 255],
    CHARCOAL: [51, 51, 51, 255],
    CALM_BLUE: [8, 141, 165, 255],
    COOL_BLUE: [64, 114, 148, 255],
    COOL_GREEN: [180, 238, 180, 255],
    CORAL: [255, 127, 80, 255],
    CORPORATE_BEIGE: [203, 203, 169, 255],
    CREAM: [240, 224, 136, 255],
    CREAMSICLE: [255, 195, 160, 255],
    CYAN: [0, 255, 255, 255],
    DARK_TURQUOISE: [0, 206, 209, 255],
    DEEP_BLUE: [0, 51, 102, 255],
    DEEP_PURPLE: [102, 0, 102, 255],
    DEEP_RED: [139, 0, 0, 255],
    DIM_GRAY: [105, 105, 105, 255],
    DULL_BLUE: [192, 214, 228, 255],
    EMERALD: [39, 89, 45, 255],
    EVERGREEN: [6, 85, 53, 255],
    FRIENDLY_BLUE: [70, 132, 153, 255],
    FUCHSIA: [255, 0, 255, 255],
    FUNNY_PURPLE: [128, 0, 128, 255],
    GOLD: [255, 215, 0, 255],
    GOLDMEMBER: [218, 165, 32, 255],
    GRAY: [192, 192, 192, 255],
    GREEN: [0, 255, 0, 255],
    GUN_METAL_GRAY: [102, 102, 102, 255],
    HARD_ORANGE_RED: [255, 64, 64, 255],
    HARD_PINK: [247, 52, 122, 255],
    HG_BLACK: [26, 26, 26, 255],
    HG_BLUE: [148, 210, 230, 255],
    HG_RED: [241, 112, 112, 255],
    HG_YELLOW: [255, 247, 143, 255],
    INTERIOR_RED: [255, 102, 102, 255],
    INVITATION_BLUE: [104, 151, 187, 255],
    KHAKI: [255, 246, 143, 255],
    LAVENDER: [230, 230, 250, 255],
    LIGHT_CORAL: [240, 128, 128, 255],
    LIGHT_SEA_GREEN: [32, 178, 170, 255],
    NAVY: [0, 0, 128, 255],
    MAGENTA: [255, 0, 255, 255],
    MAROON: [128, 0, 0, 255],
    MEAN_SEA: [129, 216, 208, 255],
    MERLOT: [66, 4, 32, 255],
    MINT: [102, 205, 170, 255],
    MUSTARD: [232, 219, 32, 255],
    NEON_BOOGER: [204, 255, 0, 255],
    NEON_PINK: [255, 128, 237, 255],
    ORANGE: [255, 165, 0, 255],
    ORANGE_RED: [255, 69, 0, 255],
    PALE_TURQUOISE: [175, 238, 238, 255],
    PEACH: [255, 218, 185, 255],
    PERFUME_PINK: [255, 228, 225, 255],
    PERRYWINKLE: [204, 204, 255, 255],
    PINK: [255, 192, 203, 255],
    POWDER_BLUE: [176, 224, 230, 255],
    PURPLE: [128, 0, 128, 255],
    REAL_ESTATE_BLUE: [14, 47, 68, 255],
    RED: [255, 0, 0, 255],
    RUST: [128, 0, 0, 255],
    SALMON: [250, 128, 114, 255],
    SEA_GREEN: [0, 128, 128, 255],
    SHARP_YELLOW: [255, 255, 102, 255],
    SILVER: [192, 192, 192, 255],
    SIMPLE_GRAY: [204, 204, 204, 255],
    SLEEPY_PINK: [255, 182, 193, 255],
    SMOKE: [245, 245, 245, 255],
    SMOOTH_BLUE: [76, 163, 221, 255],
    SOFT_GREEN: [211, 255, 206, 255],
    SOFT_MINT: [182, 252, 213, 255],
    SOFT_PINK: [255, 192, 203, 255],
    STRESSED_PURPLE: [138, 43, 226, 255],
    SKY_BLUE: [127, 229, 240, 255],
    STANDARD_GRAY: [128, 128, 128, 255],
    STORM_GRAY: [105, 105, 102, 255],
    SUCCESS_GREEN: [0, 128, 0, 255],
    TEAL: [0, 128, 128, 255],
    TENSE_SKY: [102, 204, 204, 255],
    TERRACOTTA: [226, 114, 91, 255],
    THICK_LUXURY: [195, 151, 151, 255],
    TURQUOISE: [64, 224, 208, 255],
    WALLPAPER_BEIGE: [203, 190, 181, 255],
    WALLPAPER_GREEN: [220, 237, 193, 255],
    WHITE: [255, 255, 255, 255],
    YELLOW: [255, 255, 0, 255]
};

const colorKeys = Object.keys(COLORS);

const randomColor = function(exclusionList=[]) {
    const filteredList = exclusionList.length ? filterList(colorKeys, exclusionList) : colorKeys;
    const colorIndex = Math.floor(Math.random() * filteredList.length);
    return COLORS[filteredList[colorIndex]];
};

const filterList = (colorKeys, exclusionList) => {
    if (colorKeys.length === exclusionList.length) {
        return ["WHITE"];
    }

    return colorKeys.filter(key => {
        for (const exclude of exclusionList) {
            if (key === exclude) {
                return false;
            }
        }
        return true;
    });
};

module.exports = {
    COLORS,
    randomColor
};
