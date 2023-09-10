import { Body } from '../core/components/body'
import { vec3 } from '../vectors'

export interface Collision {
  normal: vec3
  contact: vec3
  distance: number

  bodies?: Body[]
}