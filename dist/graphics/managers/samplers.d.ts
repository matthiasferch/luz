import { Sampler } from '../types/sampler';
import { Texture } from '../types/texture';
export declare class Samplers {
    private gl;
    private samplers;
    private boundSamplers;
    constructor(gl: WebGL2RenderingContext);
    create(): Sampler;
    update(sampler: Sampler, filtering: Texture.Filtering, tiling: Texture.Tiling): void;
    bind(sampler: Sampler, unit: number): void;
}
