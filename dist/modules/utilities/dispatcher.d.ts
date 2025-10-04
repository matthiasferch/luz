type Callback<T extends {
    type: string;
}, S> = (a: T, b: T) => S | null;
export declare class Dispatcher<T extends {
    type: string;
}, S, R> {
    private callbacks;
    register(firstType: S, otherType: S, callback: Callback<T, R>): void;
    dispatch(first: T, other: T): R | null;
}
export {};
