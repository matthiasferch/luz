import { Mesh } from '../types/mesh'
import { Material } from '../renderer/material'
import { Partition } from '../renderer/partition'
import { VertexArray } from '../types/vertex-array'

const vertexSize = 8 // position (xyz) + normal (xyz) + texture coordinates (uv)

const stride = vertexSize * Float32Array.BYTES_PER_ELEMENT

export class Meshes {
  constructor(private gl: WebGL2RenderingContext) {}

  create(partition: Omit<Partition, 'mesh'>, material: Material): Mesh {
    if (!partition.topology) {
      throw new Error('Mesh has no topology')
    }

    if (!partition.vertices || partition.vertices.length === 0) {
      throw new Error('Mesh has no vertices')
    }

    const vertexArray = this.gl.createVertexArray() as VertexArray

    vertexArray.topology = partition.topology
    vertexArray.vertexCount = partition.vertices.length / vertexSize

    const vertexBuffer = this.gl.createBuffer()

    const vertices = new Float32Array(partition.vertices)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)

    const boneIndices = new Float32Array(vertexArray.vertexCount * 4)
    const boneWeights = new Float32Array(vertexArray.vertexCount * 4)

    partition.weights.forEach((weight, index) => {
      boneIndices.set(weight.indices, index * 4)
      boneWeights.set(weight.weights, index * 4)
    })

    const boneIndexBuffer = this.gl.createBuffer()

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneIndexBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, boneIndices, this.gl.STATIC_DRAW)

    const boneWeightBuffer = this.gl.createBuffer()

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneWeightBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, boneWeights, this.gl.STATIC_DRAW)

    let indexBuffer: WebGLBuffer | null = null

    if (partition.indices && partition.indices.length > 0) {
      indexBuffer = this.gl.createBuffer()

      const indices = new Uint16Array(partition.indices)

      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW)

      vertexArray.indexCount = indices.length
      ;(vertexArray as any).__cpu = { vertices, indices, stride: stride }
    } else {
      vertexArray.indexCount = 0
      ;(vertexArray as any).__cpu = { vertices, indices: null, stride: stride }
    }

    this.gl.bindVertexArray(vertexArray)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)

    // position

    this.gl.enableVertexAttribArray(0)
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, stride, 0)

    // normal

    this.gl.enableVertexAttribArray(1)
    this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, true, stride, 3 * Float32Array.BYTES_PER_ELEMENT)

    // coordinates

    this.gl.enableVertexAttribArray(2)
    this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT)

    // bone indices

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneIndexBuffer)

    this.gl.vertexAttribPointer(3, 4, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(3)

    // bone weights

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneWeightBuffer)

    this.gl.vertexAttribPointer(4, 4, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(4)

    // indices

    if (indexBuffer != null) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    }

    this.gl.bindVertexArray(null)

    return { vertexArray, material }
  }

  render(mesh: Mesh) {
    const { vertexArray } = mesh
    const { topology, vertexCount, indexCount } = vertexArray

    if (!vertexArray) {
      throw new Error('Mesh has no vertex array')
    }

    let mode: number

    switch (topology) {
      case 'Points':
        mode = this.gl.POINTS
        break

      case 'Lines':
        mode = this.gl.LINES
        break

      case 'LineLoop':
        mode = this.gl.LINE_LOOP
        break

      case 'LineStrip':
        mode = this.gl.LINE_STRIP
        break

      case 'Triangles':
        mode = this.gl.TRIANGLES
        break

      case 'TriangleFan':
        mode = this.gl.TRIANGLE_FAN
        break

      case 'TriangleStrip':
        mode = this.gl.TRIANGLE_STRIP
        break

      default:
        throw new Error(`Invalid topology: ${topology}`)
    }

    this.gl.bindVertexArray(vertexArray)

    if (vertexArray.indexCount > 0) {
      this.gl.drawElements(mode, indexCount, this.gl.UNSIGNED_SHORT, 0)
    } else {
      this.gl.drawArrays(mode, 0, vertexCount)
    }

    this.gl.bindVertexArray(null)
  }
}
