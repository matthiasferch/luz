import { Transform } from './transform';
export declare abstract class Component {
    abstract readonly type: Component.Type;
    abstract readonly timestep: Component.Timestep;
    abstract update(transform: Transform, deltaTime: number): void;
    toJSON(): {
        type: Component.Type;
    };
}
export declare module Component {
    enum Type {
        Body = "body",
        Model = "model",
        Camera = "camera",
        Light = "light"
    }
    enum Timestep {
        Fixed = "fixed",
        Variable = "variable"
    }
}
