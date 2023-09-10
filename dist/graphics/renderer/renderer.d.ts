import { Camera, Light, Model, Transform } from '../../core';
import { Buffers } from '../managers/buffers';
import { Meshes } from '../managers/meshes';
import { Programs } from '../managers/programs';
import { Samplers } from '../managers/samplers';
import { Shaders } from '../managers/shaders';
import { Textures } from '../managers/textures';
import { Program } from '../types/program';
import { Display } from './display';
import { State } from './state';
export declare class Renderer {
    private gl;
    readonly shaders: Shaders;
    readonly programs: Programs;
    readonly buffers: Buffers;
    readonly textures: Textures;
    readonly samplers: Samplers;
    readonly state: State;
    readonly display: Display;
    readonly meshes: Meshes;
    constructor(gl: WebGL2RenderingContext);
    render<T extends {}>(camera: Camera, transform: Transform, model: Model, lights: Light[], program: Program, uniforms?: T): void;
    private collectUniformValues;
}
