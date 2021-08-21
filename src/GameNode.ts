import listenable from './util/listenable';
import InternalGameNode from './InternalGameNode';
import { colorDef, textDef, effectDef, inputDef, assetDef, internalGameNodeDef, gameNodeDef } from './sharedDefs';

interface shapeNodeArgs {
    color?: colorDef;
    onClick?: (arg: any) => void;
    coordinates2d: number[];
    border?: number;
    fill?: colorDef;
    text?: textDef;
    asset?: assetDef;
    playerIds?: number[];
    effects?: effectDef;
    input?: inputDef;
    shapeType: 1 | 2 | 3;
};

interface textNodeArgs {
    textInfo: textDef;
    playerIds: number[];
    input: inputDef;
};

interface assetNodeArgs {
    assetInfo: assetDef;
    onClick: (arg: any) => void;
    coordinates2d: number[];
    playerIds: number[];
    effects: effectDef;
};

export const gameNode = (
    color: colorDef,
    onClick: (arg: any) => void,
    coordinates2d: number[],
    border: number,
    fill: colorDef,
    text: textDef,
    asset: assetDef,
    playerIds: number[],
    effects: effectDef,
    input: inputDef
) => {
    const node = new InternalGameNode(color, onClick, coordinates2d, border, fill, text, asset, playerIds, effects, input);
    return <internalGameNodeDef> listenable(node, node.onStateChange.bind(node));
};

class Shape implements gameNodeDef {
    id: number;
    node: internalGameNodeDef;
    children: gameNodeDef[];

    constructor({color, onClick, shapeType, coordinates2d, border, fill, playerIds, effects, input }: shapeNodeArgs) {
        if (!coordinates2d || !shapeType) {
            throw new Error('Shape requires coordinates2d and shapeType');
        }

        this.node = gameNode(color, onClick, coordinates2d, border, fill, null, null, playerIds, effects, input);
        this.id = this.node.id;
        this.children = new Array();
    }

    addChild(child: gameNodeDef, shouldUpdateState: boolean = true) {
        this.children.push(child);
        if (shouldUpdateState) {
            this.node.onStateChange();
        }
    }

    addChildren(...nodes: gameNodeDef[]) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex], nodeIndex === nodes.length - 1);
        }
    }

    removeChild(nodeId: number) {
        const removeIndex = this.children.findIndex(child => child.id === nodeId);
        if (removeIndex >= 0) {
            if (this.children[removeIndex].node._animation) {
                clearInterval(this.children[removeIndex].node._animation);
            }
            this.children = this.children.splice(removeIndex, 1);
            this.id = this.id;
        }
    }

    addListener(listener: any) {
        this.node.addListener(listener);
    }

    clearChildren(excludedNodeIds: number[]) {
        if (!excludedNodeIds || !excludedNodeIds.length) {
            this.children = new Array();
        } else {
            const newChildren = this.children.filter(child => excludedNodeIds.includes(child.id));
            this.children = newChildren;
        }
    }
}

class Text implements gameNodeDef {
    id: number;
    node: internalGameNodeDef;
    children: gameNodeDef[];
    constructor({ textInfo, playerIds, input }: textNodeArgs) {
        if (!textInfo) {
            throw new Error('Text node requires textInfo');
        }

        this.node = gameNode(null, null, null, null, null, textInfo, null, playerIds, null, input);
        this.id = this.node.id;
        this.children = new Array();
    }

    addChild(child: gameNodeDef, shouldUpdateState: boolean = true) {
        this.children.push(child);
        if (shouldUpdateState) {
            this.node.onStateChange();
        }
    }

    addChildren(...nodes: gameNodeDef[]) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex], nodeIndex === nodes.length - 1);
        }
    }

    removeChild(nodeId: number) {
        const removeIndex = this.children.findIndex(child => child.id === nodeId);
        if (removeIndex >= 0) {
            if (this.children[removeIndex].node._animation) {
                clearInterval(this.children[removeIndex].node._animation);
            }
            this.children = this.children.splice(removeIndex, 1);
            this.id = this.id;
        }
    }

    addListener(listener: any) {
        this.node.addListener(listener);
    }

    clearChildren(excludedNodeIds: number[]) {
        if (!excludedNodeIds || !excludedNodeIds.length) {
            this.children = new Array();
        } else {
            const newChildren = this.children.filter(child => excludedNodeIds.includes(child.id));
            this.children = newChildren;
        }
    }
}

class Asset implements gameNodeDef {
    id: number;
    node: internalGameNodeDef;
    children: gameNodeDef[];
    constructor({ assetInfo, onClick, coordinates2d, playerIds, effects }: assetNodeArgs) {
        if (!assetInfo) {
            throw new Error('Asset node requires assetInfo');
        }
        this.node = gameNode(null, onClick, coordinates2d, null, null, null, assetInfo, playerIds, effects, null);
        this.id = this.node.id;
        this.children = new Array();
    }

    addChild(child: gameNodeDef, shouldUpdateState: boolean = true) {
        this.children.push(child);
        if (shouldUpdateState) {
            this.node.onStateChange();
        }
    }

    addChildren(...nodes: gameNodeDef[]) {
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            this.addChild(nodes[nodeIndex], nodeIndex === nodes.length - 1);
        }
    }

    removeChild(nodeId: number) {
        const removeIndex = this.children.findIndex(child => child.id === nodeId);
        if (removeIndex >= 0) {
            if (this.children[removeIndex].node._animation) {
                clearInterval(this.children[removeIndex].node._animation);
            }
            this.children = this.children.splice(removeIndex, 1);
            this.id = this.id;
        }
    }

    addListener(listener: any) {
        this.node.addListener(listener);
    }

    clearChildren(excludedNodeIds: number[]) {
        if (!excludedNodeIds || !excludedNodeIds.length) {
            this.children = new Array();
        } else {
            const newChildren = this.children.filter(child => excludedNodeIds.includes(child.id));
            this.children = newChildren;
        }
    }
}

export const GameNode = {
    Asset,
    Shape,
    Text
};
