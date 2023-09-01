import { mat3, vec3 } from '@luz/vectors'
import { Collider } from './collider'

export abstract class Volume extends Collider {

  readonly center: vec3

  abstract calculateInertia(mass: number): mat3

}
