import { DeserializationCallbacks, Serializable } from '@luz/utilities/serializable'
import { VertexArray } from '../types/vertex-array'
import { Material } from './material'

export type SerializedMesh = {
  topology: Mesh.Topology

  vertices: number[]
  indices?: number[]

  material?: string
}

export class Mesh extends Serializable {
  readonly topology: Mesh.Topology
  readonly vertexArray: VertexArray

  material?: Material

  constructor({ topology, vertexArray }: { topology: Mesh.Topology; vertexArray: VertexArray }) {
    super()

    this.topology = topology
    this.vertexArray = vertexArray
  }

  static async deserialize(serializedMesh: SerializedMesh, callbacks: DeserializationCallbacks) {
    return callbacks.onDeserializeMesh(serializedMesh)
  }
}

export namespace Mesh {
  export type Topology = 'points' | 'lines' | 'lineLoop' | 'lineStrip' | 'triangles' | 'triangleFan' | 'triangleStrip'
}
