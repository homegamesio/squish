import { colorDef, textDef, effectDef, inputDef, assetDef, internalGameNodeDef, coordinateDef } from './sharedDefs';
let id = 0;

export default class InternalGameNode implements internalGameNodeDef {
    id: number;
    color: colorDef;
    handleClick: (arg: any) => void;
    coordinates2d: coordinateDef[];
    border: number;
    fill: colorDef;
    text: textDef;
    asset: assetDef;
    effects: effectDef;
    input: inputDef;
    playerIds: number[];
    listeners: Set<any>;
    _animation: NodeJS.Timer;

    constructor(
            color: colorDef,
            onClick: (arg: any) => void,
            coordinates2d: coordinateDef[],
            border: number,
            fill: colorDef,
            text: textDef,
            asset: assetDef,
            playerIds: number[] = [],
            effects: effectDef = null,
            input: inputDef = null
        ) {
        this.id = id++;
        this.color = color;
        this.handleClick = onClick;
        this.coordinates2d = coordinates2d;
        this.border = border;
        this.fill = fill;
        this.text = text;
        this.asset = asset;
        this.effects = effects;
        this.input = input;
        this.listeners = new Set();
        if (playerIds && !(playerIds instanceof Array)) {
            playerIds = [playerIds];
        }
        this.playerIds = playerIds || [];
    }

    addListener(listener: any) {
        this.listeners.add(listener);
    }

    onStateChange() {
        for (const listener of this.listeners) {
            listener.handleStateChange(this);
        }
    }
}
