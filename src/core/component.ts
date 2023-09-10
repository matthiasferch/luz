import { Transform } from './transform'

export abstract class Component {

  abstract readonly type: Component.Type

  abstract readonly timestep: Component.Timestep

  abstract update(transform: Transform, deltaTime: number): void

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

  export enum Timestep {
    Fixed = 'fixed',
    Variable = 'variable'
  }

}