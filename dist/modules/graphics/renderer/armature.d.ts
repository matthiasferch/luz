import { Serializable } from '@luz/utilities';
import { Animation } from './animation';
import { Bone } from './bone';
export declare class Armature extends Serializable {
    readonly bones: Bone[];
    readonly rootBones: Bone[];
    static deserialize(data: Partial<Armature>): Promise<Armature>;
    update(deltaTime: number, animations: Animation[]): void;
}
