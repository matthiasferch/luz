import { Serializable } from '@luz/utilities';
import { ScaleKeyframe, RotationKeyframe, TranslationKeyframe } from './keyframe';
export declare class Keyframes extends Serializable {
    readonly scale: ScaleKeyframe[];
    readonly rotation: RotationKeyframe[];
    readonly translation: TranslationKeyframe[];
}
export declare class Animation extends Serializable {
    readonly keyframes: Record<string, Keyframes>;
    readonly duration: number;
    time: number;
    weight: number;
    state: Animation.State;
    update(deltaTime: number): void;
}
export declare namespace Animation {
    type State = 'Play' | 'Pause' | 'Stop' | 'Loop';
}
