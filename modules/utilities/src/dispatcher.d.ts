type Callback<T extends {
    type: string;
}, S> = (a: T, b: T) => S | null;
export declare class Dispatcher<T extends {
    type: string;
}, S> {
    private callbacks;
    register(firstType: string, otherType: string, callback: Callback<T, S>): void;
    dispatch(first: T, other: T): S | null;
}
export {};
