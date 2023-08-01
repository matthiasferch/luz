import { vec3 } from '@luz/vectors'

import { Body } from './body'

export interface Collision {
  normal: vec3
  contact: vec3
  distance: number

  bodies?: Body[]
}