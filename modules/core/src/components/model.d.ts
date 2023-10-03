import { Mesh, Texture } from '@luz/graphics';
import { vec3 } from '@luz/vectors';
import { Component } from '../component';
import { Transform } from '../transform';
export declare class Model extends Component {
    readonly type = Component.Type.Model;
    readonly timestep = Component.Timestep.Variable;
    topology: Mesh.Topology;
    vertices: number[];
    indices?: number[];
    images?: string[];
    readonly color: Readonly<vec3>;
    mesh: Mesh;
    texture: Texture;
    update(transform: Transform, deltaTime: number): void;
}
