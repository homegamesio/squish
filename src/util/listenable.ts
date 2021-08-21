import { gameNodeDef, internalGameNodeDef } from '../sharedDefs';
export default (obj: internalGameNodeDef, onChange: () => void) => {
    const handler = {
        get(target: Object, property: PropertyKey, receiver: any) {
            return Reflect.get(target, property, receiver);
        },
        defineProperty(target: Object, property: PropertyKey, descriptor: PropertyDescriptor) {
            const change = Reflect.defineProperty(target, property, descriptor);
            onChange && onChange();
            return change;
        },
        deleteProperty(target: Object, property: PropertyKey) {
            const change = Reflect.deleteProperty(target, property);
            onChange && onChange();
            return change;
        }
    };

    return new Proxy(obj, handler);
};
