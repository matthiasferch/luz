type UniformProperty = {
    key: string;
    type: any;
};
export declare function Uniform(): (target: Object, key: string) => void;
export declare function getUniformProperties(target: Function): UniformProperty[];
export {};
