import { Vector3 } from '@luz/math'
import { Collider } from '../collider'
import { Serialize, Register } from '@luz/serialization'

export interface PolygonOptions {
  vertices?: readonly Vector3[]
}

@Register('polygon')
export class Polygon extends Collider {
  readonly type = 'polygon'

  private readonly vertexData: Vector3[] = []
  private readonly edgeData: Vector3[] = []
  private readonly triangleData: Array<[Vector3, Vector3, Vector3]> = []

  @Serialize(Vector3)
  get vertices(): readonly Vector3[] {
    return this.vertexData
  }

  set vertices(vertices: readonly Vector3[]) {
    this.setVertices(vertices)
  }

  get edges(): readonly Vector3[] {
    return this.edgeData
  }

  get triangles(): ReadonlyArray<readonly [Vector3, Vector3, Vector3]> {
    return this.triangleData
  }

  readonly normal: Vector3 = Vector3.createZero()

  constructor({ vertices = [] }: PolygonOptions = {}) {
    super()

    this.vertexData = vertices.map((vertex) => vertex.clone())

    if (this.vertices.length === 0) {
      return
    }

    this.validate()
  }

  validate(): void {
    if (
      this.vertices.length < 3 ||
      this.vertices.some((vertex) => vertex.xyz.some((value) => !Number.isFinite(value)))
    ) {
      throw new Error('Polygon requires at least three finite vertices')
    }

    this.edgeData.length = 0

    this.vertices.forEach((vertex, index) =>
      this.edgeData.push(Vector3.subtract(this.vertices[(index + 1) % this.vertices.length], vertex))
    )

    const edge1 = Vector3.subtract(this.vertices[1], this.vertices[0])
    const edge2 = Vector3.subtract(this.vertices[2], this.vertices[0])

    Vector3.calculateCrossProduct(edge1, edge2, this.normal).normalize()

    if (this.normal.magnitude < 0.5) {
      throw new Error('Polygon must have non-collinear initial vertices')
    }

    if (
      this.vertices.some(
        (vertex) =>
          Math.abs(Vector3.calculateDotProduct(Vector3.subtract(vertex, this.vertices[0]), this.normal)) > 1e-4
      )
    ) {
      throw new Error('Polygon must be planar')
    }

    this.triangleData.length = 0

    const remainingVertices = this.vertices.slice()
    const cross = (firstVertex: Vector3, secondVertex: Vector3, thirdVertex: Vector3) =>
      Vector3.calculateDotProduct(
        Vector3.calculateCrossProduct(
          Vector3.subtract(secondVertex, firstVertex),
          Vector3.subtract(thirdVertex, secondVertex)
        ),
        this.normal
      )

    while (remainingVertices.length > 3) {
      let hasClippedEar = false

      for (let index = 0; index < remainingVertices.length; index++) {
        const firstVertex = remainingVertices[(index + remainingVertices.length - 1) % remainingVertices.length]
        const secondVertex = remainingVertices[index],
          thirdVertex = remainingVertices[(index + 1) % remainingVertices.length]

        if (cross(firstVertex, secondVertex, thirdVertex) <= 1e-8) {
          continue
        }

        if (
          remainingVertices.some(
            (point) =>
              point !== firstVertex &&
              point !== secondVertex &&
              point !== thirdVertex &&
              cross(firstVertex, secondVertex, point) >= -1e-8 &&
              cross(secondVertex, thirdVertex, point) >= -1e-8 &&
              cross(thirdVertex, firstVertex, point) >= -1e-8
          )
        ) {
          continue
        }

        this.triangleData.push([firstVertex, secondVertex, thirdVertex])
        remainingVertices.splice(index, 1)

        hasClippedEar = true
        break
      }

      if (!hasClippedEar) {
        throw new Error('Polygon must be simple and nondegenerate')
      }
    }

    this.triangleData.push(remainingVertices as [Vector3, Vector3, Vector3])
  }

  setVertices(vertices: readonly Vector3[]): void {
    // Validate before replacing the live geometry.
    const replacement = new Polygon({ vertices: [...vertices] })

    replacement.validate()
    this.vertexData.splice(0, this.vertices.length, ...replacement.vertices)
    this.validate()
  }

  static async deserialize(data: unknown): Promise<Polygon> {
    const polygon = (await super.deserialize(data)) as Polygon

    polygon.validate()

    return polygon
  }
}

export const isPolygon = (collider: Collider): collider is Polygon => {
  return collider.type === 'polygon'
}
