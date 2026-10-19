import { Serializable, Serialize } from '@luz/serialization'
import type { Transform } from './transform'

export abstract class Component extends Serializable {
  @Serialize()
  abstract readonly type: string

  abstract readonly timestep: Component.Timestep

  abstract update(transform: Transform, deltaTime: number): void
}

export namespace Component {
  export type Type = 'body' | 'biped' | 'model' | 'camera' | 'light' | 'reflector' | 'animation'

  export type Timestep = 'fixed' | 'variable' | 'animation'
}
