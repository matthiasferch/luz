import { Mesh } from '../renderer/mesh'
import { IndexBuffer } from '../buffers/index-buffer'
import { VertexBuffer } from '../buffers/vertex-buffer'
import { VertexArray } from '../types/vertex-array'

const vertexSize = 8 // position (xyz) + normal (xyz) + texture coordinates (uv)

export class Meshes {

  constructor(private gl: WebGL2RenderingContext) { }

  create(topology: Mesh.Topology, vertices: Float32Array, indices?: Uint16Array): Mesh | null {
    let vertexArray = this.gl.createVertexArray() as VertexArray
    let vertexBuffer = this.gl.createBuffer() as VertexBuffer

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)

    vertexArray.vertexCount = vertices.length / vertexSize

    let indexBuffer: IndexBuffer = null

    if (indices && indices.length > 0) {
      indexBuffer = this.gl.createBuffer() as IndexBuffer

      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW)

      vertexArray.indexCount = indices.length
    } else {
      vertexArray.indexCount = 0
    }

    this.gl.bindVertexArray(vertexArray)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)

    if (indexBuffer) {
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

    return new Mesh(
      topology,
      vertexArray
    )
  }

  render(mesh: Mesh) {
    let mode: number

    switch (mesh.topology) {
      case Mesh.Topology.Points:
        mode = this.gl.POINTS
        break

      case Mesh.Topology.Lines:
        mode = this.gl.LINES
        break

      case Mesh.Topology.LineLoop:
        mode = this.gl.LINE_LOOP
        break

      case Mesh.Topology.LineStrip:
        mode = this.gl.LINE_STRIP
        break

      case Mesh.Topology.Triangles:
        mode = this.gl.TRIANGLES
        break

      case Mesh.Topology.TriangleFan:
        mode = this.gl.TRIANGLE_FAN
        break

      case Mesh.Topology.TriangleStrip:
        mode = this.gl.TRIANGLE_STRIP
        break
    }

    this.gl.bindVertexArray(mesh.vertexArray)

    if (mesh.vertexArray.indexCount > 0) {
      this.gl.drawElements(mode, mesh.vertexArray.indexCount, this.gl.UNSIGNED_SHORT, 0)
    } else {
      this.gl.drawArrays(mode, 0, mesh.vertexArray.vertexCount)
    }

    this.gl.bindVertexArray(null)
  }

}