import { Texture } from '../types/texture';
export declare class Textures {
    private gl;
    private textures;
    private boundTextures;
    constructor(gl: WebGL2RenderingContext);
    create(target: number, format: number, width: number, height: number, filtering: Texture.Filtering, tiling: Texture.Tiling, mipmaps: boolean): Texture;
    update(texture: Texture, source: any, x?: number, y?: number, width?: number, height?: number): void;
    private bind;
}
