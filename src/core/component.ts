import { Serialized, Serializable } from '../utilities'
import { Transform } from './transform'

export abstract class Component extends Serializable {

  @Serialized
  abstract readonly type: Component.Type

  abstract readonly timestep: Component.Timestep

  abstract update(transform: Transform, deltaTime: number): void

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