import { Serializable, Serialize } from '@luz/utilities'
import { Transform } from './transform'

export abstract class Component extends Serializable {
  @Serialize()
  abstract readonly type: Component.Type

  abstract update(transform: Transform, deltaTime: number): void
}

export namespace Component {
  export type Type = 'Body' | 'Biped' | 'Model' | 'Camera' | 'Light'
}
