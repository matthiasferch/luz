import { Mesh, Texture } from '../../graphics';
import { vec3 } from '../../vectors';
import { Component } from '../component';
import { Transform } from '../transform';
export declare class Model extends Component {
    readonly type = Component.Type.Model;
    readonly timestep = Component.Timestep.Variable;
    baseColor: Readonly<vec3>;
    baseTexture: Texture;
    mesh: Mesh;
    update(transform: Transform, deltaTime: number): void;
    toJSON(): {
        baseColor: Readonly<vec3>;
        type: Component.Type;
    };
}
