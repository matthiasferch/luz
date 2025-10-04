import { Material, Partition, Armature, Animation } from '@luz/graphics';
import { Component } from '../component';
import { Transform } from '../transform';
export declare class Model extends Component {
    readonly type: Component.Type;
    readonly timestep: Component.Timestep;
    readonly materials: Record<string, Material>;
    readonly partitions: Record<string, Partition>;
    readonly armatures: Record<string, Armature>;
    readonly animations: Record<string, Animation>;
    boneMatrices: Float32Array;
    isAnimated: boolean;
    static deserialize(data: Partial<Model>): Promise<Model>;
    update(transform: Transform, deltaTime: number): void;
}
