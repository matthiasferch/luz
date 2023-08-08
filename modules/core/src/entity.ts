import { Transform } from './transform'

export class Entity extends Transform {

  readonly type: Entity.Type

}

export module Entity {

  export enum Type {
    Model,
    Light,
    Camera
  }

}