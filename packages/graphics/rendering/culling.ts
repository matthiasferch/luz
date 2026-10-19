import type { Camera, Entity, Frustum, Light, Rectangle } from '@luz/core'
import { BoundingBox, isLight } from '@luz/core'
import { Matrix4, Vector3, Vector4 } from '@luz/math'
import { calculateColliderBoundingBox, isBody } from '@luz/physics'
import type { Scene } from '@luz/scene'
import { Pool } from '@luz/serialization'
import type { ModelCompiler } from '../compilers/model-compiler'
import { isModel } from '../model'
import type { LightBatch } from '../renderer/light-batch'
import type { RenderBatch } from '../renderer/render-batch'
import {
  calculateBoundingBoxNormalizedDeviceCoordinateRectangle,
  calculateFrustumNormalizedDeviceCoordinateRectangle
} from './projected-rectangle'

export interface CullingResult {
  opaqueBatches: RenderBatch[]
  transparentBatches: RenderBatch[]
  allLights: Light[]
  visibleLights: Light[]
}

const cullingBuffers = new Pool({
  createObject: () => ({
    boundingBox: new BoundingBox(),
    vertices: Array.from({ length: 8 }, () => new Vector3()),
    position: new Vector4()
  }),

  resetObject: (buffers) => buffers,
  initialCapacity: 2
})

export class Culling {
  static computeLightScissor(
    light: Light,
    camera: Camera,
    targetWidth: number,
    targetHeight: number,
    margin: number = 0
  ): Rectangle | null {
    if (light.isDirectional) {
      return { x: 0, y: 0, width: targetWidth, height: targetHeight }
    }

    const normalizedDeviceCoordinates =
      light.isPoint && light.boundingBox
        ? calculateBoundingBoxNormalizedDeviceCoordinateRectangle(
            light.boundingBox,
            Matrix4.multiply(camera.projectionMatrix, camera.viewMatrix)
          )
        : calculateFrustumNormalizedDeviceCoordinateRectangle(light.shadowCamera.frustum, camera)

    if (!normalizedDeviceCoordinates) {
      return null
    }

    const marginPixels = Math.max(0, Math.floor(margin))
    const screenX0 = (normalizedDeviceCoordinates.minimumX + 1) * 0.5 * targetWidth
    const screenY0 = (normalizedDeviceCoordinates.minimumY + 1) * 0.5 * targetHeight
    const screenX1 = (normalizedDeviceCoordinates.maximumX + 1) * 0.5 * targetWidth
    const screenY1 = (normalizedDeviceCoordinates.maximumY + 1) * 0.5 * targetHeight

    const minimumX = Math.floor(Math.max(0, Math.min(screenX0, screenX1) - marginPixels))
    const minimumY = Math.floor(Math.max(0, Math.min(screenY0, screenY1) - marginPixels))
    const maximumX = Math.ceil(Math.min(targetWidth, Math.max(screenX0, screenX1) + marginPixels))
    const maximumY = Math.ceil(Math.min(targetHeight, Math.max(screenY0, screenY1) + marginPixels))

    const width = Math.max(0, maximumX - minimumX)
    const height = Math.max(0, maximumY - minimumY)

    if (width <= 0 || height <= 0) {
      return null
    }

    return { x: minimumX, y: minimumY, width, height }
  }

  static cullScene(scene: Scene, camera: Camera, models: ModelCompiler): CullingResult {
    return cullingBuffers.runInScope(() => {
      const { frustum, viewMatrix } = camera
      const { position } = cullingBuffers.acquire()

      const opaqueBatches: RenderBatch[] = []
      const transparentBatches: RenderBatch[] = []

      const entities = scene.collectEntities()
      const visibleEntities = this.cullEntities(entities, frustum)

      for (const entity of visibleEntities) {
        const { worldTranslation: translation, components } = entity

        const { x, y, z } = translation

        position.x = x
        position.y = y
        position.z = z
        position.w = 1

        viewMatrix.transform(position, position)

        const depth = -position.z

        for (const component of Object.values(components)) {
          if (!isModel(component) || !component.isVisible) {
            continue
          }

          const renderModel = models.requireCompiledModel(component)
          const { primitives } = renderModel
          const opaqueMeshes: string[] = []

          for (const [name, primitive] of Object.entries(primitives)) {
            const { material } = primitive

            if (!material.isOpaque) {
              transparentBatches.push({ transform: entity, model: renderModel, meshes: [name], depth })
            } else {
              opaqueMeshes.push(name)
            }
          }

          if (opaqueMeshes.length > 0) {
            opaqueBatches.push({ transform: entity, model: renderModel, meshes: opaqueMeshes, depth })
          }
        }
      }

      const allLights = entities
        .flatMap(({ components }) => Object.values(components))
        .filter((component): component is Light => isLight(component) && component.isVisible)

      const visibleLights = this.cullLights(entities, camera.frustum)

      return { opaqueBatches, transparentBatches, allLights, visibleLights }
    })
  }

  static buildLightingTasks(
    entities: Entity[],
    visibleLights: Light[],
    camera: Camera,
    targetWidth: number,
    targetHeight: number,
    margin: number
  ): LightBatch[] {
    return visibleLights
      .filter((light) => light.isVisible)
      .map((light) => {
        const entitiesWithinLightFrustum = light.isPoint
          ? entities
          : this.cullEntities(entities, light.shadowCamera.frustum)
        const scissor = this.computeLightScissor(light, camera, targetWidth, targetHeight, margin)

        return {
          light,
          entities: entitiesWithinLightFrustum,
          ...(light.isPoint
            ? { shadowEntities: light.shadowCameras.map((camera) => this.cullEntities(entities, camera.frustum)) }
            : {}),
          scissor: scissor ?? undefined
        }
      })
  }

  private static cullEntities(entities: Entity[], frustum: Frustum): Entity[] {
    return cullingBuffers.runInScope(() => {
      const { boundingBox } = cullingBuffers.acquire()

      return entities.filter(({ components }) => {
        const bodies = Object.values(components).filter((component) => {
          return isBody(component)
        })

        if (bodies.length === 0) {
          return true
        }

        return bodies.some(({ volume }) => {
          return frustum.intersectsBoundingBox(calculateColliderBoundingBox(volume, boundingBox))
        })
      })
    })
  }

  private static cullLights(entities: Entity[], frustum: Frustum): Light[] {
    return cullingBuffers.runInScope(() => {
      const { boundingBox: scratchBoundingBox, vertices } = cullingBuffers.acquire()
      const lights = entities
        .flatMap(({ components }) => Object.values(components))
        .filter((component): component is Light => isLight(component) && component.isVisible)

      const visibleLights = lights.filter((light) => {
        if (light.isDirectional) {
          return true
        }

        const boundingBox =
          light.boundingBox ??
          BoundingBox.calculateFromPoints(light.shadowCamera.frustum.calculateVertices(vertices), scratchBoundingBox)

        return frustum.intersectsBoundingBox(boundingBox)
      })

      return visibleLights.length > 0 ? visibleLights : lights.filter((light) => !light.isPoint)
    })
  }
}
