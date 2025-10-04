import { Texture } from '../types/texture';
import { Surface } from '../renderer/surface';
export declare class Textures {
    private gl;
    private textures;
    private boundTextures;
    constructor(gl: WebGL2RenderingContext);
    create(surface: Partial<Surface>): Texture;
    update(texture: Texture, data: any, x?: number, y?: number, width?: number, height?: number): void;
    bind(texture: Texture, unit: number): void;
}
