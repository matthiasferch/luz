import { vec4 } from '../../vectors';
export declare class Display {
    private gl;
    constructor(gl: WebGL2RenderingContext);
    set viewport(viewport: Readonly<vec4>);
    clear(color: Readonly<vec4>, depth: number, stencil?: number): void;
}
