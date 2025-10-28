import { Mesh } from '../../../types/mesh'
import { Material } from '../../material'
import { Partition } from '../../partition'
import { VertexArray } from '../../../types/vertex-array'
import { MeshManager } from '../../renderer'

const vertexSize = 8 // position (xyz) + normal (xyz) + texture coordinates (uv)

const stride = vertexSize * Float32Array.BYTES_PER_ELEMENT

export class WebGL2MeshManager implements MeshManager {
  constructor(private gl: WebGL2RenderingContext) { }

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

    // Precompute tangents/bitangents for the mesh (per-vertex)
    const { tangents, bitangents } = computeTangentsAndBitangents(partition)

    const tangentBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tangentBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, tangents, this.gl.STATIC_DRAW)

    const bitangentBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bitangentBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, bitangents, this.gl.STATIC_DRAW)

    let boneIndexBuffer: WebGLBuffer | null = null
    let boneWeightBuffer: WebGLBuffer | null = null

    if (partition.weights && partition.weights.length > 0) {
      const boneIndices = new Float32Array(vertexArray.vertexCount * 4)
      const boneWeights = new Float32Array(vertexArray.vertexCount * 4)

      partition.weights.forEach((weight, index) => {
        boneIndices.set(weight.indices, index * 4)
        boneWeights.set(weight.weights, index * 4)
      })

      boneIndexBuffer = this.gl.createBuffer()

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneIndexBuffer)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, boneIndices, this.gl.STATIC_DRAW)

      boneWeightBuffer = this.gl.createBuffer()

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneWeightBuffer)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, boneWeights, this.gl.STATIC_DRAW)
    }

    let indexBuffer: WebGLBuffer | null = null

    if (partition.indices && partition.indices.length > 0) {
      indexBuffer = this.gl.createBuffer()

      const indices = new Uint16Array(partition.indices)

      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW)

      vertexArray.indexCount = indices.length
    } else {
      vertexArray.indexCount = 0
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

    // tangent (xyz)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tangentBuffer)
    this.gl.vertexAttribPointer(5, 3, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(5)

    // bitangent (xyz)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bitangentBuffer)
    this.gl.vertexAttribPointer(6, 3, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(6)

    if (boneIndexBuffer != null && boneWeightBuffer != null) {
      // bone indices
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneIndexBuffer)
      this.gl.vertexAttribPointer(3, 4, this.gl.FLOAT, false, 0, 0)
      this.gl.enableVertexAttribArray(3)

      // bone weights
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneWeightBuffer)
      this.gl.vertexAttribPointer(4, 4, this.gl.FLOAT, false, 0, 0)
      this.gl.enableVertexAttribArray(4)
    }

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

// Helper methods
class _Vec3 {
  constructor(public x = 0, public y = 0, public z = 0) { }

  set(x: number, y: number, z: number) {
    this.x = x; this.y = y; this.z = z; return this
  }

  add(v: _Vec3) { this.x += v.x; this.y += v.y; this.z += v.z; return this }

  sub(a: _Vec3, b: _Vec3) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this }

  scale(s: number) { this.x *= s; this.y *= s; this.z *= s; return this }

  dot(v: _Vec3) { return this.x * v.x + this.y * v.y + this.z * v.z }

  cross(a: _Vec3, b: _Vec3) {
    const x = a.y * b.z - a.z * b.y
    const y = a.z * b.x - a.x * b.z
    const z = a.x * b.y - a.y * b.x
    this.x = x; this.y = y; this.z = z; return this
  }

  length() { return Math.hypot(this.x, this.y, this.z) }

  normalize() {
    const len = this.length()
    if (len > 1e-8) { this.x /= len; this.y /= len; this.z /= len }
    return this
  }

  copy(v: _Vec3) { this.x = v.x; this.y = v.y; this.z = v.z; return this }
}

class _Vec2 {
  constructor(public x = 0, public y = 0) { }

  set(x: number, y: number) { this.x = x; this.y = y; return this }
  sub(a: _Vec2, b: _Vec2) { this.x = a.x - b.x; this.y = a.y - b.y; return this }
}

// Computes per-vertex tangents/bitangents from interleaved vertices and optional indices
// Assumes vertices are laid out as: position(3), normal(3), uv(2)
function computeTangentsAndBitangents(partition: Omit<Partition, 'mesh'>): { tangents: Float32Array, bitangents: Float32Array } {
  const verts = partition.vertices
  const count = Math.floor(verts.length / vertexSize)

  const tanAccum = new Array<_Vec3>(count)
  const bitanAccum = new Array<_Vec3>(count)
  const normals = new Array<_Vec3>(count)

  for (let i = 0; i < count; i++) {
    tanAccum[i] = new _Vec3()
    bitanAccum[i] = new _Vec3()
    const n = new _Vec3(
      verts[i * vertexSize + 3],
      verts[i * vertexSize + 4],
      verts[i * vertexSize + 5],
    )
    normals[i] = n
  }

  const i0 = new _Vec3(), i1 = new _Vec3(), i2 = new _Vec3()
  const uv0 = new _Vec2(), uv1 = new _Vec2(), uv2 = new _Vec2()
  const dp1 = new _Vec3(), dp2 = new _Vec3()
  const duv1 = new _Vec2(), duv2 = new _Vec2()

  const addTriangle = (a: number, b: number, c: number) => {
    // positions
    i0.set(verts[a * vertexSize + 0], verts[a * vertexSize + 1], verts[a * vertexSize + 2])
    i1.set(verts[b * vertexSize + 0], verts[b * vertexSize + 1], verts[b * vertexSize + 2])
    i2.set(verts[c * vertexSize + 0], verts[c * vertexSize + 1], verts[c * vertexSize + 2])

    // uvs
    uv0.set(verts[a * vertexSize + 6], verts[a * vertexSize + 7])
    uv1.set(verts[b * vertexSize + 6], verts[b * vertexSize + 7])
    uv2.set(verts[c * vertexSize + 6], verts[c * vertexSize + 7])

    dp1.sub(i1, i0)
    dp2.sub(i2, i0)
    duv1.sub(uv1, uv0)
    duv2.sub(uv2, uv0)

    const det = duv1.x * duv2.y - duv1.y * duv2.x
    if (Math.abs(det) < 1e-8) return
    const r = 1.0 / det

    const tangent = new _Vec3(
      (dp1.x * duv2.y - dp2.x * duv1.y) * r,
      (dp1.y * duv2.y - dp2.y * duv1.y) * r,
      (dp1.z * duv2.y - dp2.z * duv1.y) * r,
    )

    const bitangent = new _Vec3(
      (dp2.x * duv1.x - dp1.x * duv2.x) * r,
      (dp2.y * duv1.x - dp1.y * duv2.x) * r,
      (dp2.z * duv1.x - dp1.z * duv2.x) * r,
    )

    tanAccum[a].add(tangent); tanAccum[b].add(tangent); tanAccum[c].add(tangent)
    bitanAccum[a].add(bitangent); bitanAccum[b].add(bitangent); bitanAccum[c].add(bitangent)
  }

  const indices = partition.indices && partition.indices.length > 0 ? partition.indices : null
  if (indices) {
    for (let k = 0; k + 2 < indices.length; k += 3) {
      addTriangle(indices[k]!, indices[k + 1]!, indices[k + 2]!)
    }
  } else if (partition.topology === 'Triangles') {
    for (let k = 0; k + 2 < count; k += 3) {
      addTriangle(k, k + 1, k + 2)
    }
  } else {
    // Unsupported for non-triangle topologies; fill zeros
  }

  const tangents = new Float32Array(count * 3)
  const bitangents = new Float32Array(count * 3)

  const tmp = new _Vec3(), nCrossT = new _Vec3()
  for (let v = 0; v < count; v++) {
    const N = normals[v]
    const T = tmp.copy(tanAccum[v])
    // Orthonormalize T against N
    const ndotT = N.dot(T)
    T.x -= N.x * ndotT; T.y -= N.y * ndotT; T.z -= N.z * ndotT
    if (T.length() > 1e-8) T.normalize(); else T.set(1, 0, 0)

    // Compute handedness/sign using accumulated bitangent
    nCrossT.cross(N, T)
    const handed = (nCrossT.x * bitanAccum[v].x + nCrossT.y * bitanAccum[v].y + nCrossT.z * bitanAccum[v].z) < 0 ? -1 : 1
    // Build orthonormal B
    const B = new _Vec3(nCrossT.x * handed, nCrossT.y * handed, nCrossT.z * handed).normalize()

    tangents[v * 3 + 0] = T.x; tangents[v * 3 + 1] = T.y; tangents[v * 3 + 2] = T.z
    bitangents[v * 3 + 0] = B.x; bitangents[v * 3 + 1] = B.y; bitangents[v * 3 + 2] = B.z
  }

  return { tangents, bitangents }
}
