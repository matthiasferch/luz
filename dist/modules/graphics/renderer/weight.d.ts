import { Serializable } from '@luz/utilities';
export declare class Weight extends Serializable {
    readonly vertex: number;
    readonly indices: number[];
    readonly weights: number[];
}
