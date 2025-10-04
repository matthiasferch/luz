type ClassConstructor = new (...args: any[]) => any;
export declare function Register(): (classConstructor: ClassConstructor) => void;
export declare function getRegisteredClass(value: any): any;
export {};
