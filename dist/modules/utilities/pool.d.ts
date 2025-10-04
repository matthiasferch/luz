export declare class Pool<T> {
    private create;
    private reset;
    private initialSize;
    private batchSize;
    private readonly pool;
    private maximumSize;
    constructor(create: () => T, reset: (object: T) => T, initialSize: number, // number of objects to allocate on pool creation
    batchSize?: number);
    get length(): number;
    acquire(): T;
    release(object: T): void;
    private allocate;
}
