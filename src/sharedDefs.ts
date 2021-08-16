export type colorDef = [number, number, number, number];

export interface textDef {
    text: string;
    x: number;
    y: number;
    size: number;
    align: 'left' | 'center' | 'right';
    color: colorDef;
};

export interface effectDef {
    shadow: {
        color: colorDef;
        blur: number;
    }
};

export interface inputDef {
    type: 'text' | 'file';
    oninput: (player: number, data: any) => void;
};

interface assetInfoDef {
    pos: { x: number, y: number };
    size: { x: number, y: number };
};

export interface assetDef {
    assetInfo: Record<string, assetInfoDef>;
    onClick: (arg: any) => void;
    coordinates2d: number[];
    playerIds: number[];
};

export interface internalGameNodeDef {
    id: number;
    color: colorDef;
    handleClick: (arg: any) => void;
    coordinates2d: number[];
    border: number;
    fill: colorDef;
    text: textDef;
    asset: assetDef;
    effects: effectDef;
    input: inputDef;
    playerIds: number[];
    listeners: Set<any>;
    _animation: NodeJS.Timer;
    onStateChange: () => void;
    addListener: (listener: any) => void;
};

export interface playerDef {
    id: number;
};

export interface playersDef {
    [propName: number]: playerDef;
};

export interface gameDef {
    players: playersDef;
    timeouts: NodeJS.Timeout[];
    intervals: NodeJS.Timer[];
    listeners: any;
    root: gameNodeDef;
};

export interface gameNodeDef {
    node: internalGameNodeDef;
	id: number;
    children: gameNodeDef[];
};