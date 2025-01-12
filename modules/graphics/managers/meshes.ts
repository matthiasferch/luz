import { Material } from '../renderer/material'
import { Mesh } from '../renderer/mesh'
import { Partition } from '../renderer/partition'
import { VertexArray } from '../types/vertex-array'

const vertexSize = 8 // position (xyz) + normal (xyz) + texture coordinates (uv)

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

    const vertexBuffer = this.gl.createBuffer()

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(partition.vertices), this.gl.STATIC_DRAW)

    vertexArray.vertexCount = partition.vertices.length / vertexSize

    let indexBuffer: WebGLBuffer | null = null

    if (partition.indices && partition.indices.length > 0) {
      const { indices } = partition

      indexBuffer = this.gl.createBuffer()

      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW)

      vertexArray.indexCount = indices.length
    } else {
      vertexArray.indexCount = 0
    }

    this.gl.bindVertexArray(vertexArray)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)

    if (indexBuffer != null) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    }

    const stride = vertexSize * Float32Array.BYTES_PER_ELEMENT

    // position
    this.gl.enableVertexAttribArray(0)
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, stride, 0)

    // normal
    this.gl.enableVertexAttribArray(1)
    this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, true, stride, 3 * Float32Array.BYTES_PER_ELEMENT)

    // texture coordinates
    this.gl.enableVertexAttribArray(2)
    this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT)

    this.gl.bindVertexArray(null)

    return { vertexArray, material }
  }

  render(mesh: Mesh) {
    const { vertexArray } = mesh

    if (!vertexArray) {
      throw new Error('Mesh has no vertex array')
    }

    let mode: number

    switch (vertexArray.topology) {
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
        throw new Error(`Invalid topology: ${vertexArray.topology}`)
    }

    this.gl.bindVertexArray(vertexArray)

    if (vertexArray.indexCount > 0) {
      this.gl.drawElements(mode, vertexArray.indexCount, this.gl.UNSIGNED_SHORT, 0)
    } else {
      this.gl.drawArrays(mode, 0, vertexArray.vertexCount)
    }

    this.gl.bindVertexArray(null)
  }
}
