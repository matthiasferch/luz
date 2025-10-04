import { Camera, Entity, Light, Model, Transform } from '@luz/core';
import { Meshes } from '../managers/meshes';
import { Buffers } from '../managers/buffers';
import { Programs } from '../managers/programs';
import { Samplers } from '../managers/samplers';
import { Shaders } from '../managers/shaders';
import { Textures } from '../managers/textures';
import { Program } from '../types/program';
import { State } from './state';
import { Texture } from '../types/texture';
import { Material } from './material';
import { RenderTarget } from './target';
import { vec4 } from '@luz/vectors';
import { RenderPass } from './pass';
type MaskOptions = {
    color: boolean[];
    depth: boolean;
};
type ClearOptions = {
    color: vec4;
    depth: number;
    stencil: number;
};
export declare class Renderer {
    private gl;
    readonly state: State;
    readonly shaders: Shaders;
    readonly programs: Programs;
    readonly meshes: Meshes;
    readonly buffers: Buffers;
    readonly textures: Textures;
    readonly samplers: Samplers;
    readonly defaultTexture: Texture;
    readonly defaultMaterial: Material;
    constructor(gl: WebGL2RenderingContext);
    use(target: RenderTarget): void;
    mask({ color, depth }: Partial<MaskOptions>): void;
    clear({ color, depth, stencil }: Partial<ClearOptions>): void;
    renderPass<T extends {}>(pass: RenderPass, camera: Camera, entities: Entity[], light: Light, uniforms?: T): void;
    renderModel<T extends {}>(camera: Camera | null, transform: Transform, model: Model, light: Light, program: Program, additionalUniforms?: T): void;
    private collectUniformValues;
}
export {};
