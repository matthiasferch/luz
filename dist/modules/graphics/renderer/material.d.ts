import { Serializable } from '@luz/utilities';
import { vec3 } from '@luz/vectors';
import { Surface } from './surface';
import { Texture } from '../types/texture';
export declare class Material extends Serializable {
    readonly color: vec3;
    surface: Surface | null;
    texture: Texture;
    constructor({ color, texture }?: Partial<Material>);
}
