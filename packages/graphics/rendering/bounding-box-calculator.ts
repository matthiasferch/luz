import type { Transform } from '@luz/core'
import { BoundingBox } from '@luz/core'
import type { Model } from '../model'
import type { Mesh } from '../renderer/mesh'

interface BoundingBoxGeometry {
  geometryRevision: number
  vertices: ArrayLike<number> | undefined
  indices: ArrayLike<number> | undefined
  weights: Mesh['weights']
  vertexCount: number
  indexCount: number
  weightCount: number
  stride: number
  offset: number
  positions: Float32Array
  influences: Float32Array
  matrixOffsets: Uint32Array
}

interface BoundingBoxCache {
  matrix: Float32Array
  revision: number
  boundingBox: BoundingBox | null
}

interface PosedGeometry {
  meshes: BoundingBoxGeometry[]
  palette: Float32Array
  isAnimated: boolean
  positions: Float32Array
  revision: number
  boundingBoxesByTransform: WeakMap<Transform, BoundingBoxCache>
}

export class BoundingBoxCalculator {
  private geometry = new WeakMap<Mesh, BoundingBoxGeometry>()
  private poses = new WeakMap<Model, PosedGeometry>()

  clear(): void {
    this.geometry = new WeakMap()
    this.poses = new WeakMap()
  }

  calculate(model: Model, transform: Transform): BoundingBox | null {
    const meshes = Object.values(model.meshes).map((mesh) => this.prepareGeometry(mesh))
    const palette = model.isAnimated ? model.boneMatrices : undefined

    let pose = this.poses.get(model)

    if (!pose) {
      pose = {
        meshes: [],
        palette: new Float32Array(),
        isAnimated: false,
        positions: new Float32Array(),
        revision: 0,
        boundingBoxesByTransform: new WeakMap()
      }

      this.poses.set(model, pose)
    }

    if (
      pose.revision === 0 ||
      pose.isAnimated !== model.isAnimated ||
      meshes.length !== pose.meshes.length ||
      meshes.some((mesh, index) => mesh !== pose!.meshes[index]) ||
      (palette?.length ?? 0) !== pose.palette.length ||
      (palette && palette.some((value, index) => value !== pose!.palette[index]))
    ) {
      this.updatePose(pose, meshes, palette)

      pose.isAnimated = model.isAnimated
    }

    let cache = pose.boundingBoxesByTransform.get(transform)

    if (!cache) {
      cache = { matrix: new Float32Array(16), revision: -1, boundingBox: null }

      pose.boundingBoxesByTransform.set(transform, cache)
    }

    const matrix = transform.modelMatrix

    if (cache.revision !== pose.revision || matrix.some((value, index) => value !== cache!.matrix[index])) {
      cache.boundingBox = this.calculateBoundingBox(pose.positions, matrix)
      cache.revision = pose.revision

      cache.matrix.set(matrix)
    }

    return cache.boundingBox
  }

  private prepareGeometry(mesh: Mesh): BoundingBoxGeometry {
    const descriptor = mesh.resolvedGeometry?.descriptor
    const vertices = mesh.resolvedGeometry?.vertices ?? (Array.isArray(mesh.vertices) ? mesh.vertices : undefined)
    const indices = mesh.resolvedGeometry?.indices ?? (Array.isArray(mesh.indices) ? mesh.indices : undefined)
    const stride = descriptor ? descriptor.byteStride / 4 : 8
    const offset = descriptor ? descriptor.attributes.position.byteOffset / 4 : 0
    const vertexCount = descriptor?.count ?? (vertices?.length ?? 0) / 8
    const indexCount = indices?.length ?? 0
    const cachedGeometry = this.geometry.get(mesh)

    if (
      cachedGeometry &&
      cachedGeometry.geometryRevision === mesh.geometryRevision &&
      cachedGeometry.vertices === vertices &&
      cachedGeometry.indices === indices &&
      cachedGeometry.weights === mesh.weights &&
      cachedGeometry.weightCount === mesh.weights.length &&
      cachedGeometry.vertexCount === vertexCount &&
      cachedGeometry.indexCount === indexCount &&
      cachedGeometry.stride === stride &&
      cachedGeometry.offset === offset
    ) {
      return cachedGeometry
    }

    const references = indexCount
      ? Array.from(new Set(indices!))
      : Array.from({ length: vertexCount }, (_value, index) => index)
    const weights = new Map(mesh.weights.map((weight) => [weight.vertex, weight]))
    const geometry: BoundingBoxGeometry = {
      geometryRevision: mesh.geometryRevision,
      vertices,
      indices,
      weights: mesh.weights,
      vertexCount,
      indexCount,
      weightCount: mesh.weights.length,
      stride,
      offset,
      positions: new Float32Array(references.length * 4),
      influences: new Float32Array(references.length * 4),
      matrixOffsets: new Uint32Array(references.length * 4)
    }

    for (let entry = 0; entry < references.length; entry++) {
      const vertex = references[entry]
      const sourceOffset = vertex * stride + offset
      const targetOffset = entry * 4
      const weight = weights.get(vertex)

      geometry.positions[targetOffset] = vertices![sourceOffset]
      geometry.positions[targetOffset + 1] = vertices![sourceOffset + 1]
      geometry.positions[targetOffset + 2] = vertices![sourceOffset + 2]
      geometry.positions[targetOffset + 3] = 1

      if (weight && weight.weights.reduce((total, value) => total + value, 0) > 0) {
        for (let influence = 0; influence < 4; influence++) {
          geometry.influences[targetOffset + influence] = weight.weights[influence]
          geometry.matrixOffsets[targetOffset + influence] = weight.indices[influence] * 16
        }
      }
    }

    this.geometry.set(mesh, geometry)

    return geometry
  }

  private updatePose(pose: PosedGeometry, meshes: BoundingBoxGeometry[], palette: Float32Array | undefined): void {
    const length = meshes.reduce((total, mesh) => total + mesh.positions.length, 0)

    if (pose.positions.length !== length) {
      pose.positions = new Float32Array(length)
    }

    if (pose.palette.length !== (palette?.length ?? 0)) {
      pose.palette = new Float32Array(palette?.length ?? 0)
    }

    if (palette) {
      pose.palette.set(palette)
    }

    let destinationOffset = 0

    for (const mesh of meshes) {
      pose.positions.set(mesh.positions, destinationOffset)

      if (palette) {
        for (let offset = 0; offset < mesh.positions.length; offset += 4) {
          const influences = mesh.influences

          if (influences[offset] + influences[offset + 1] + influences[offset + 2] + influences[offset + 3] === 0) {
            continue
          }

          const x = mesh.positions[offset]
          const y = mesh.positions[offset + 1]
          const z = mesh.positions[offset + 2]
          const targetOffset = destinationOffset + offset

          pose.positions.fill(0, targetOffset, targetOffset + 4)

          for (let influence = 0; influence < 4; influence++) {
            const weight = influences[offset + influence]

            if (weight === 0) {
              continue
            }

            const matrixOffset = mesh.matrixOffsets[offset + influence]

            for (let row = 0; row < 4; row++) {
              pose.positions[targetOffset + row] +=
                weight *
                (palette[matrixOffset + row] * x +
                  palette[matrixOffset + 4 + row] * y +
                  palette[matrixOffset + 8 + row] * z +
                  palette[matrixOffset + 12 + row])
            }
          }
        }
      }

      destinationOffset += mesh.positions.length
    }

    pose.meshes = meshes
    pose.revision++
  }

  private calculateBoundingBox(positions: Float32Array, matrix: ArrayLike<number>): BoundingBox | null {
    const boundingBox = new BoundingBox()

    let minimumX = Infinity
    let minimumY = Infinity
    let minimumZ = Infinity
    let maximumX = -Infinity
    let maximumY = -Infinity
    let maximumZ = -Infinity

    for (let offset = 0; offset < positions.length; offset += 4) {
      const x = positions[offset]
      const y = positions[offset + 1]
      const z = positions[offset + 2]
      const w = positions[offset + 3]
      const worldX = Math.fround(matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w)
      const worldY = Math.fround(matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w)
      const worldZ = Math.fround(matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w)
      const worldW = Math.fround(matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w)

      if (!Number.isFinite(worldX + worldY + worldZ + worldW) || worldW === 0) {
        continue
      }

      minimumX = Math.min(minimumX, worldX / worldW)
      minimumY = Math.min(minimumY, worldY / worldW)
      minimumZ = Math.min(minimumZ, worldZ / worldW)
      maximumX = Math.max(maximumX, worldX / worldW)
      maximumY = Math.max(maximumY, worldY / worldW)
      maximumZ = Math.max(maximumZ, worldZ / worldW)
    }

    if (minimumX === Infinity) {
      return null
    }

    boundingBox.minimum.set([minimumX, minimumY, minimumZ])
    boundingBox.maximum.set([maximumX, maximumY, maximumZ])

    return boundingBox
  }
}
