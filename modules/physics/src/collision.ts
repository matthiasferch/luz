import { Body } from '@luz/core'
import { vec3 } from '@luz/vectors'

export interface Collision {
  normal: vec3
  contact: vec3
  distance: number

  bodies?: Body[]
}