import { Serializable } from '@luz/utilities';
import { Transform } from './transform';
export declare abstract class Component extends Serializable {
    abstract readonly type: Component.Type;
    abstract readonly timestep: Component.Timestep;
    abstract update(transform: Transform, deltaTime: number): void;
}
export declare namespace Component {
    type Type = 'Body' | 'Biped' | 'Model' | 'Camera' | 'Light';
    type Timestep = 'Fixed' | 'Variable';
}
