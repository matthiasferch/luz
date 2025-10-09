import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Serialize, Register } from '@luz/utilities'

@Register()
export class Polygon extends Collider {
  type: Collider.Type = 'Polygon'

  @Serialize()
  readonly vertices: vec3[] = []

  readonly edges: vec3[]

  readonly normal: vec3

  constructor({ vertices = [] }: { vertices?: vec3[] } = {}) {
    super()

    this.vertices = vertices.map((vertex) => vertex.copy())

    if (this.vertices.length < 3) {
      return
    }

    this.edges = [
      vec3.subtract(this.vertices[1], this.vertices[0]),
      vec3.subtract(this.vertices[2], this.vertices[1]),
      vec3.subtract(this.vertices[0], this.vertices[2])
    ]

    const edge1 = vec3.subtract(vertices[1], vertices[0])
    const edge2 = vec3.subtract(vertices[2], vertices[0])

    this.normal = vec3.cross(edge1, edge2).normalize()
  }
}

export const isPolygon = (collider: Collider): collider is Polygon => {
  return collider.type === 'Polygon'
}
