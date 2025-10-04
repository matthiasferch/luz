import { Serializable } from '@luz/utilities';
import { vec3, quat } from '@luz/vectors';
export declare abstract class Keyframe<T extends vec3 | quat> extends Serializable {
    readonly time: number;
    abstract value: T;
}
export declare class ScaleKeyframe extends Keyframe<vec3> {
    readonly value: vec3;
}
export declare class RotationKeyframe extends Keyframe<quat> {
    readonly value: quat;
}
export declare class TranslationKeyframe extends Keyframe<vec3> {
    readonly value: vec3;
}
