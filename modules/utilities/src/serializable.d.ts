export declare function Serialized(target: Object, propertyKey: string): void;
export declare class Serializable {
    serialize(): {};
    static deserialize<T extends Serializable>(this: new () => T, data: any): T;
    private static getAllSerializableProperties;
}
