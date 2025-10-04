import { Serializable } from '@luz/utilities/serializable';
import { VertexArray } from '../types/vertex-array';
import { Mesh } from '../types/mesh';
import { Weight } from './weight';
export declare class Partition extends Serializable {
    readonly topology: VertexArray.Topology;
    readonly vertices: number[];
    readonly indices: number[];
    readonly weights: Weight[];
    readonly material: string;
    mesh?: Mesh;
    constructor(data?: Partial<Partition>);
}
