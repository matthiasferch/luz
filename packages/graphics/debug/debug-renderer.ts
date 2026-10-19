import type { Camera, Frustum, Transform, BoundingBox } from '@luz/core'
import { isCamera, isLight } from '@luz/core'
import { Vector3 } from '@luz/math'
import { Cuboid, Cylinder, Ellipsoid, Plane, Polygon, Sphere, calculateColliderBoundingBox, isBody } from '@luz/physics'
import type { Scene } from '@luz/scene'
import { Pool } from '@luz/serialization'
import { isModel } from '../model'
import type { Bone } from '../renderer/bone'
import type { LightBatch } from '../renderer/light-batch'
import type { RenderBackend } from '../renderer/render-backend'
import { BoundingBoxCalculator } from '../rendering/bounding-box-calculator'
import type { Program } from '../types/program'
import { DEBUG_COLORS, type OverlayCategory } from './colors'
import { OverlayBatch } from './overlay-batch'
import type { DebugSettings } from './settings'

import { Vector2 } from '@luz/math'
import type { RenderPipeline } from '../renderer/render-pipeline'
import type { FrameResult } from '../rendering/frame-result'
import { compileBuiltinPipeline, createPipelineCompiler } from '../rendering/shader-catalog'

export interface OverlayFrame {
  width: number
  height: number
  pixelRatio: number
  lightBatches: readonly LightBatch[]
  lightingWidth: number
  lightingHeight: number
}

const zeroVector = Vector3.createZero()
const rightVector = Vector3.createRight()
const upVector = Vector3.createUp()

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 16
})

const appendVertex = (vertices: number[], position: Vector3): void => {
  vertices.push(position.x, position.y, position.z)
}

export class DebugRenderer {
  private readonly batches = Object.fromEntries(
    Object.entries(DEBUG_COLORS).map(([category, style]) => [category, new OverlayBatch(style)])
  ) as Record<OverlayCategory, OverlayBatch>
  private readonly joints = new OverlayBatch(DEBUG_COLORS.armature)
  private readonly contacts = new OverlayBatch(DEBUG_COLORS.contact)
  private readonly cameraCones = new OverlayBatch(DEBUG_COLORS.camera, true)
  private readonly lightCones = new OverlayBatch(DEBUG_COLORS.light, true)
  private readonly contactCones = new OverlayBatch(DEBUG_COLORS.contact, true)
  private readonly boundingBoxCalculator = new BoundingBoxCalculator()
  private readonly geometryVertices: number[] = []
  private resetGeometry(): number[] {
    this.geometryVertices.length = 0

    return this.geometryVertices
  }

  private collectCollisions(scene: Scene): void {
    for (const { collisions } of scene.collisionManifolds) {
      for (const { point, normal } of collisions) {
        this.batches.contact.append(this.createArrowVertices(point, Vector3.add(point, normal), this.contactCones))
        this.contacts.append(this.createLineVertices(point, zeroVector))
      }
    }
  }

  private collectColliders(scene: Scene): void {
    for (const collider of Object.values(scene.colliders)) {
      if (collider instanceof Plane) {
        this.batches.collider.append(this.createPlaneVertices(collider))
      } else if (collider instanceof Polygon) {
        this.batches.collider.append(this.createPolygonVertices(collider))
      }
    }

    for (const entity of scene.collectEntities()) {
      for (const component of Object.values(entity.components)) {
        if (!isBody(component)) {
          continue
        }

        const { volume } = component

        if (volume instanceof Sphere) {
          this.batches.collider.append(this.createSphereVertices(volume, 120, this.resetGeometry()))
        } else if (volume instanceof Cuboid) {
          this.batches.collider.append(this.createCuboidVertices(volume, this.resetGeometry()))
        } else if (volume instanceof Cylinder) {
          this.batches.collider.append(this.createCylinderVertices(volume, 120, this.resetGeometry()))
        } else if (volume instanceof Ellipsoid) {
          this.batches.collider.append(this.createEllipsoidVertices(volume, 120, this.resetGeometry()))
        }
      }
    }
  }

  private collectEntities(scene: Scene, camera: Camera, settings: DebugSettings): void {
    for (const entity of scene.collectEntities()) {
      for (const component of Object.values(entity.components)) {
        if (isModel(component) && component.isVisible) {
          if (settings.areArmaturesVisible) {
            for (const armature of Object.values(component.armatures)) {
              for (const bone of armature.bones) {
                this.batches.armature.append(this.createBoneVertices(bone, entity))

                const head = entity.modelMatrix.transformVector3(bone.poseMatrix.transformVector3(bone.head))
                const tail = entity.modelMatrix.transformVector3(bone.poseMatrix.transformVector3(bone.tail))

                this.joints.append(this.createLineVertices(head, zeroVector))
                this.joints.append(this.createLineVertices(tail, zeroVector))
              }
            }
          }

          if (settings.areModelBoundingBoxesVisible) {
            const boundingBox = this.boundingBoxCalculator.calculate(component, entity)

            if (boundingBox) {
              this.batches.model.append(this.createBoundingBoxVertices(boundingBox, this.resetGeometry()))
            }
          }
        }

        if (isBody(component) && settings.areBodyBoundingBoxesVisible) {
          const boundingBox = calculateColliderBoundingBox(component.volume)
          const category = camera.frustum.intersectsBoundingBox(boundingBox) ? 'bodyInside' : 'bodyOutside'

          this.batches[category].append(this.createBoundingBoxVertices(boundingBox, this.resetGeometry()))
        }

        if (isCamera(component) && component !== camera && settings.areCameraFrustumsVisible) {
          this.batches.camera.append(this.createProjectorVertices(component.frustum, this.cameraCones))
        }

        if (isLight(component) && component.isVisible) {
          if (settings.areLightFrustumsVisible) {
            for (const shadowCamera of component.shadowCameras) {
              this.batches.light.append(this.createProjectorVertices(shadowCamera.frustum, this.lightCones))
            }
          }
        }
      }
    }
  }

  private collectScissors(frame: OverlayFrame): void {
    for (const lightBatch of frame.lightBatches) {
      const scissor = lightBatch.scissor ?? { x: 0, y: 0, width: frame.lightingWidth, height: frame.lightingHeight }

      const minimumX = (scissor.x / frame.lightingWidth) * 2 - 1
      const minimumY = (scissor.y / frame.lightingHeight) * 2 - 1
      const maximumX = ((scissor.x + scissor.width) / frame.lightingWidth) * 2 - 1
      const maximumY = ((scissor.y + scissor.height) / frame.lightingHeight) * 2 - 1
      const corners = [
        new Vector3([minimumX, minimumY, 0]),
        new Vector3([maximumX, minimumY, 0]),
        new Vector3([maximumX, maximumY, 0]),
        new Vector3([minimumX, maximumY, 0])
      ]
      const vertices: number[] = []

      for (let cornerIndex = 0; cornerIndex < 4; cornerIndex++) {
        appendVertex(vertices, corners[cornerIndex])
        appendVertex(vertices, corners[(cornerIndex + 1) % 4])
      }

      this.batches.scissor.append(vertices)
    }
  }

  private createArrowVertices(startPosition: Vector3, endPosition: Vector3, cones: OverlayBatch): number[] {
    const direction = Vector3.subtract(endPosition, startPosition)

    if (direction.magnitude === 0) {
      return []
    }

    cones.append(this.createLineVertices(startPosition, direction))

    return this.createLineVertices(startPosition, direction.scale(0.96))
  }

  private createProjectorVertices(frustum: Frustum, cones: OverlayBatch): number[] {
    const vertices = this.createFrustumVertices(frustum)
    const corners = frustum.calculateVertices()
    const nearCenter = Vector3.add(corners[0], corners[3]).scale(0.5)
    const farCenter = Vector3.add(corners[4], corners[7]).scale(0.5)
    const direction = Vector3.subtract(farCenter, nearCenter).scale(0.15)

    vertices.push(...this.createArrowVertices(nearCenter, Vector3.add(nearCenter, direction), cones))

    return vertices
  }
  private createLineVertices = (startPosition: Vector3, directionOffset: Vector3) => {
    const lineVertices: number[] = []

    appendVertex(lineVertices, startPosition)
    appendVertex(lineVertices, Vector3.add(startPosition, directionOffset))

    return lineVertices
  }
  private createPlaneVertices = (plane: Plane, planeSize: number = 1) => {
    const { normal, distance } = plane

    const normalizedNormal = normal.clone().normalize()
    const pointOnPlane = Vector3.scale(normalizedNormal, distance)

    const referenceVector = Math.abs(normalizedNormal.x) < 0.99 ? rightVector : upVector

    const tangentPrimary = Vector3.calculateCrossProduct(normalizedNormal, referenceVector).normalize()
    const tangentSecondary = Vector3.calculateCrossProduct(normalizedNormal, tangentPrimary).normalize()

    const halfPlaneSize = planeSize / 2

    const corner1 = Vector3.add(pointOnPlane, Vector3.scale(tangentPrimary, halfPlaneSize)).add(
      Vector3.scale(tangentSecondary, halfPlaneSize)
    )
    const corner2 = Vector3.add(pointOnPlane, Vector3.scale(tangentPrimary, -halfPlaneSize)).add(
      Vector3.scale(tangentSecondary, halfPlaneSize)
    )
    const corner3 = Vector3.add(pointOnPlane, Vector3.scale(tangentPrimary, -halfPlaneSize)).add(
      Vector3.scale(tangentSecondary, -halfPlaneSize)
    )
    const corner4 = Vector3.add(pointOnPlane, Vector3.scale(tangentPrimary, halfPlaneSize)).add(
      Vector3.scale(tangentSecondary, -halfPlaneSize)
    )

    const planeVertices: number[] = []

    appendVertex(planeVertices, corner1)
    appendVertex(planeVertices, corner2)
    appendVertex(planeVertices, corner2)
    appendVertex(planeVertices, corner3)
    appendVertex(planeVertices, corner3)
    appendVertex(planeVertices, corner4)
    appendVertex(planeVertices, corner4)
    appendVertex(planeVertices, corner1)

    const endPoint = Vector3.add(pointOnPlane, Vector3.scale(normalizedNormal, planeSize))

    appendVertex(planeVertices, pointOnPlane)
    appendVertex(planeVertices, endPoint)

    return planeVertices
  }
  private createPolygonVertices = (polygon: Polygon) => {
    const { vertices } = polygon

    const polygonVertices: number[] = []

    vertices.forEach((vertex, index) => {
      const nextIndex = (index + 1) % vertices.length
      const nextVertex = vertices[nextIndex]

      appendVertex(polygonVertices, vertex)
      appendVertex(polygonVertices, nextVertex)
    })

    const center = vertices
      .reduce((center, vertex) => Vector3.add(center, vertex), Vector3.createZero())
      .scale(1 / vertices.length)

    const endPoint = Vector3.add(center, polygon.normal)

    appendVertex(polygonVertices, center)
    appendVertex(polygonVertices, endPoint)

    return polygonVertices
  }
  private createBoneVertices = (bone: Bone, transform: Transform) => {
    const direction = Vector3.subtract(bone.tail, bone.head)
    const length = Math.hypot(...direction)
    const vertices: number[] = []

    if (!length) {
      return vertices
    }

    direction.scale(1 / length)

    const reference = Math.abs(direction.y) < 0.9 ? upVector : rightVector
    const firstAxis = Vector3.calculateCrossProduct(direction, reference)
      .normalize()
      .scale(length * 0.1)
    const secondAxis = Vector3.calculateCrossProduct(direction, firstAxis)
      .normalize()
      .scale(length * 0.1)
    const center = Vector3.add(bone.head, Vector3.scale(direction, length * 0.2))
    const corners = [
      Vector3.add(center, firstAxis),
      Vector3.add(center, secondAxis),
      Vector3.subtract(center, firstAxis),
      Vector3.subtract(center, secondAxis)
    ]
    const transformPoint = (point: Vector3) =>
      transform.modelMatrix.transformVector3(bone.poseMatrix.transformVector3(point))
    const head = transformPoint(bone.head)
    const tail = transformPoint(bone.tail)

    for (let cornerIndex = 0; cornerIndex < 4; cornerIndex++) {
      const corner = transformPoint(corners[cornerIndex])

      appendVertex(vertices, head)
      appendVertex(vertices, corner)
      appendVertex(vertices, tail)
      appendVertex(vertices, corner)
      appendVertex(vertices, corner)
      appendVertex(vertices, transformPoint(corners[(cornerIndex + 1) % 4]))
    }

    return vertices
  }
  private createSphereVertices = (sphere: Sphere, segmentCount = 120, destination: number[] = []) =>
    vectors.runInScope(() => {
      const { center, radius } = sphere
      const sphereVertices = destination
      const position = vectors.acquire()

      for (let axisIndex = 0; axisIndex < 3; ++axisIndex) {
        for (let segmentIndex = 0; segmentIndex < segmentCount; ++segmentIndex) {
          for (let endpointIndex = 0; endpointIndex < 2; ++endpointIndex) {
            const angle = (segmentIndex + endpointIndex) * ((2 * Math.PI) / segmentCount)

            if (axisIndex === 0) {
              position.x = center.x
              position.y = center.y + radius * Math.sin(angle)
              position.z = center.z + radius * Math.cos(angle)
            } else if (axisIndex === 1) {
              position.x = center.x + radius * Math.sin(angle)
              position.y = center.y
              position.z = center.z + radius * Math.cos(angle)
            } else {
              position.x = center.x + radius * Math.cos(angle)
              position.y = center.y + radius * Math.sin(angle)
              position.z = center.z
            }

            appendVertex(sphereVertices, position)
          }
        }
      }

      return sphereVertices
    })
  private createCuboidVertices = (cuboid: Cuboid, destination: number[] = []) =>
    vectors.runInScope(() => {
      const { center, extents, axes } = cuboid
      const vertices: Vector3[] = []
      const xAxis = vectors.acquire()
      const yAxis = vectors.acquire()
      const zAxis = vectors.acquire()

      const axisSigns = [
        [+1, +1, +1],
        [+1, +1, -1],
        [+1, -1, +1],
        [+1, -1, -1],
        [-1, +1, +1],
        [-1, +1, -1],
        [-1, -1, +1],
        [-1, -1, -1]
      ]

      axisSigns.forEach(([x, y, z]) => {
        Vector3.scale(axes[0], extents.x * x, xAxis)
        Vector3.scale(axes[1], extents.y * y, yAxis)
        Vector3.scale(axes[2], extents.z * z, zAxis)
        vertices.push(
          Vector3.add(center, Vector3.add(xAxis, Vector3.add(yAxis, zAxis, yAxis), xAxis), vectors.acquire())
        )
      })

      const indices = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 4, 5, 2, 3, 6, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 4, 2, 6, 1, 5, 3, 7]

      const cuboidVertices = destination

      indices.forEach((cornerIndex) => {
        appendVertex(cuboidVertices, vertices[cornerIndex])
      })
      axes.forEach((axisDirection) => {
        appendVertex(cuboidVertices, center)
        appendVertex(cuboidVertices, Vector3.add(center, axisDirection, xAxis))
      })

      return cuboidVertices
    })
  private createCylinderVertices = (cylinder: Cylinder, segmentCount = 120, destination: number[] = []) =>
    vectors.runInScope(() => {
      const { center, axes, radius, height } = cylinder

      const radialAxisPrimary = axes[0]
      const radialAxisSecondary = axes[1]
      const longitudinalAxis = axes[2]

      const halfHeight = height / 2

      const primaryOffset = vectors.acquire()
      const secondaryOffset = vectors.acquire()
      const ringPoint = vectors.acquire()
      const topCenter = Vector3.add(
        center,
        Vector3.scale(longitudinalAxis, halfHeight, primaryOffset),
        vectors.acquire()
      )
      const bottomCenter = Vector3.add(
        center,
        Vector3.scale(longitudinalAxis, -halfHeight, primaryOffset),
        vectors.acquire()
      )

      const cylinderVertices = destination

      const addRingVertices = (center: Vector3) => {
        for (let segmentLoopIndex = 0; segmentLoopIndex < segmentCount; segmentLoopIndex++) {
          for (let segmentSubIndex = 0; segmentSubIndex < 2; segmentSubIndex++) {
            const segmentAngle = (segmentLoopIndex + segmentSubIndex) * ((2 * Math.PI) / segmentCount)

            Vector3.add(
              center,
              Vector3.add(
                Vector3.scale(radialAxisPrimary, radius * Math.cos(segmentAngle), primaryOffset),
                Vector3.scale(radialAxisSecondary, radius * Math.sin(segmentAngle), secondaryOffset),
                primaryOffset
              ),
              ringPoint
            )
            appendVertex(cylinderVertices, ringPoint)
          }
        }
      }

      addRingVertices(topCenter)
      addRingVertices(bottomCenter)

      const directionVectors = [
        radialAxisPrimary,
        radialAxisSecondary,

        Vector3.scale(radialAxisPrimary, -1, vectors.acquire()),
        Vector3.scale(radialAxisSecondary, -1, vectors.acquire())
      ]

      directionVectors.forEach((vector) => {
        appendVertex(
          cylinderVertices,
          Vector3.add(bottomCenter, Vector3.scale(vector, radius, primaryOffset), ringPoint)
        )
        appendVertex(cylinderVertices, Vector3.add(topCenter, Vector3.scale(vector, radius, primaryOffset), ringPoint))
      })

      return cylinderVertices
    })
  private createEllipsoidVertices = (ellipsoid: Ellipsoid, segmentCount = 120, destination: number[] = []) =>
    vectors.runInScope(() => {
      const { center, axes, radius } = ellipsoid

      const radiusX = radius.x
      const radiusY = radius.y
      const radiusZ = radius.z

      const ellipsoidVertices = destination
      const primaryOffset = vectors.acquire()
      const secondaryOffset = vectors.acquire()
      const ringPoint = vectors.acquire()
      const addRingVertices = (
        primaryAxis: Vector3,
        primaryRadius: number,
        secondaryAxis: Vector3,
        secondaryRadius: number
      ) => {
        for (let segmentIndex = 0; segmentIndex < segmentCount; ++segmentIndex) {
          for (let endpointIndex = 0; endpointIndex < 2; ++endpointIndex) {
            const angle = (segmentIndex + endpointIndex) * ((2 * Math.PI) / segmentCount)

            Vector3.scale(primaryAxis, primaryRadius * Math.cos(angle), primaryOffset)
            Vector3.scale(secondaryAxis, secondaryRadius * Math.sin(angle), secondaryOffset)
            Vector3.add(center, Vector3.add(primaryOffset, secondaryOffset, primaryOffset), ringPoint)
            appendVertex(ellipsoidVertices, ringPoint)
          }
        }
      }

      addRingVertices(axes[1], radiusY, axes[2], radiusZ)
      addRingVertices(axes[0], radiusX, axes[2], radiusZ)
      addRingVertices(axes[0], radiusX, axes[1], radiusY)

      return ellipsoidVertices
    })
  private createFrustumVertices = (frustum: Frustum) => {
    const vertices = frustum.calculateVertices()

    const edges = [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],
      [4, 5],
      [5, 7],
      [7, 6],
      [6, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7]
    ]

    const frustumVertices: number[] = []

    for (const [e1, e2] of edges) {
      appendVertex(frustumVertices, vertices[e1])
      appendVertex(frustumVertices, vertices[e2])
    }

    return frustumVertices
  }
  private createBoundingBoxVertices = (boundingBox: BoundingBox, destination: number[] = []) => {
    const { minimum, maximum } = boundingBox

    const vertices = [
      new Vector3([minimum.x, minimum.y, minimum.z]),
      new Vector3([maximum.x, minimum.y, minimum.z]),
      new Vector3([minimum.x, maximum.y, minimum.z]),
      new Vector3([maximum.x, maximum.y, minimum.z]),
      new Vector3([minimum.x, minimum.y, maximum.z]),
      new Vector3([maximum.x, minimum.y, maximum.z]),
      new Vector3([minimum.x, maximum.y, maximum.z]),
      new Vector3([maximum.x, maximum.y, maximum.z])
    ]

    const edges = [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],
      [4, 5],
      [5, 7],
      [7, 6],
      [6, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7]
    ]

    const boundingBoxVertices = destination

    for (const [e1, e2] of edges) {
      appendVertex(boundingBoxVertices, vertices[e1])
      appendVertex(boundingBoxVertices, vertices[e2])
    }

    return boundingBoxVertices
  }
  private pipeline?: RenderPipeline

  private readonly pipelineCompiler
  constructor(private readonly backend: RenderBackend) {
    this.pipelineCompiler = createPipelineCompiler(backend)
  }

  render(scene: Scene, camera: Camera, settings: DebugSettings, frame: FrameResult, pixelRatio = 1): void {
    if (!settings.areGeometryOverlaysVisible) {
      return
    }

    this.pipeline ??= compileBuiltinPipeline(this.pipelineCompiler, 'debug.pipeline.json')

    const program = this.pipeline.program!

    this.backend.bindTarget(frame.target)

    this.backend.scissor = null

    this.backend.bindPipeline(this.pipeline)
    this.backend.bindCameraUniforms(program, camera)
    this.backend.bindUniforms(program, {
      viewportSize: new Vector2([frame.target.width, frame.target.height]),
      depthTexture: frame.depthTexture,
      depthJitter: frame.depthJitter
    })
    this.draw(scene, camera, program, settings, {
      width: frame.target.width,
      height: frame.target.height,
      pixelRatio,
      lightBatches: frame.lightBatches,
      lightingWidth: frame.target.width,
      lightingHeight: frame.target.height
    })
  }

  private draw(
    scene: Scene,
    camera: Camera,
    program: Program,
    settings: DebugSettings,
    frame: OverlayFrame = { width: 1, height: 1, pixelRatio: 1, lightBatches: [], lightingWidth: 1, lightingHeight: 1 }
  ): void {
    for (const batch of Object.values(this.batches)) {
      batch.reset()
    }

    this.joints.reset()
    this.contacts.reset()
    this.cameraCones.reset()
    this.lightCones.reset()
    this.contactCones.reset()

    if (!settings.areGeometryOverlaysVisible) {
      return
    }

    if (settings.areCollisionsVisible) {
      this.collectCollisions(scene)
    }

    if (settings.areCollidersVisible) {
      this.collectColliders(scene)
    }

    const isEntityGeometryEnabled =
      settings.areArmaturesVisible ||
      settings.areCameraFrustumsVisible ||
      settings.areLightFrustumsVisible ||
      settings.areBodyBoundingBoxesVisible ||
      settings.areModelBoundingBoxesVisible

    if (isEntityGeometryEnabled) {
      this.collectEntities(scene, camera, settings)
    }

    if (settings.areLightScissorsVisible) {
      this.collectScissors(frame)
    }

    const lineWidth = settings.overlayLineWidth

    for (const [category, batch] of Object.entries(this.batches)) {
      if (batch.isEmpty) {
        continue
      }

      this.backend.bindUniforms(program, {
        baseColor: batch.color,
        lineWidth,
        opacity: settings.overlayOpacity,
        pixelRatio: frame.pixelRatio,
        depthMode: ['occluded', 'visible', 'always'].indexOf(settings.overlayDepthMode),
        isScreenSpace: category === 'scissor',
        isDashed: category === 'bodyOutside',
        isCone: false
      })
      batch.draw(this.backend)
    }

    for (const batch of [this.joints, this.contacts, this.cameraCones, this.lightCones, this.contactCones]) {
      if (batch.isEmpty) {
        continue
      }

      this.backend.bindUniforms(program, {
        baseColor: batch.color,
        lineWidth: lineWidth * 3,
        opacity: settings.overlayOpacity,
        pixelRatio: frame.pixelRatio,
        depthMode: ['occluded', 'visible', 'always'].indexOf(settings.overlayDepthMode),
        isScreenSpace: false,
        isDashed: false,
        isCone: batch.isCone
      })
      batch.draw(this.backend)
    }
  }

  destroy(): void {
    for (const batch of [
      ...Object.values(this.batches),
      this.joints,
      this.contacts,
      this.cameraCones,
      this.lightCones,
      this.contactCones
    ]) {
      batch.destroy(this.backend)
    }

    this.boundingBoxCalculator.clear()
    this.pipelineCompiler.clear()

    this.pipeline = undefined
  }
}
