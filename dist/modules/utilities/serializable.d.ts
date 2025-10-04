import 'reflect-metadata';
export declare function Serialize(valueType?: any): (target: Object, key: string) => void;
export declare class Serializable {
    serialize(): {};
    static deserialize(data: any): Promise<Serializable>;
    private static getAllSerializableProperties;
}
