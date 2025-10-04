import { Mesh } from '../types/mesh';
import { Material } from '../renderer/material';
import { Partition } from '../renderer/partition';
export declare class Meshes {
    private gl;
    constructor(gl: WebGL2RenderingContext);
    create(partition: Omit<Partition, 'mesh'>, material: Material): Mesh;
    render(mesh: Mesh): void;
}
