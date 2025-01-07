import { Serializable, Serialized } from '@luz/utilities'
import { Transform } from './transform'

export abstract class Component extends Serializable {
  @Serialized
  abstract readonly type: Component.Type

  abstract readonly timestep: Component.Timestep

  abstract update(transform: Transform, deltaTime: number): void
}

export namespace Component {
  export type Type = 'body' | 'model' | 'camera' | 'light'
  export type Timestep = 'fixed' | 'variable'
}
