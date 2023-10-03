import { Mesh } from '../renderer/mesh';
export declare class Meshes {
    private gl;
    constructor(gl: WebGL2RenderingContext);
    create(data: {
        topology: string;
        vertices: number[];
        indices?: number[];
    }): Mesh | null;
    render(mesh: Mesh): void;
}
