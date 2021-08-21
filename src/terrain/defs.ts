export interface pointDef {
    x: number;
    y: number;
};

export interface boardInfo {
    filled: boolean;
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
	wentSouth?: boolean;
	wentEast?: boolean;
	wentNorth?: boolean;
	wentWest?: boolean;
};
