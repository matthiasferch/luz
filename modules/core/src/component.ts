import { Transform } from './transform'

export abstract class Component {

  readonly type: Component.Type

  abstract update(transform: Transform, deltaTime: number): void;

  toJSON() {
    const { type } = this

    return { type }
  }

}

export module Component {

  export enum Type {
    Body = 'body',
    Model = 'model',
    Camera = 'camera',
    Light = 'light'
  }

}