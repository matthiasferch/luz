import { Serializable, Serialize, readDefinition } from '@luz/serialization'
import { SynchronizationPolicy } from '@luz/formats'
import type { EnvironmentDefinition } from '@luz/formats'
import { Quaternion, Vector3 } from '@luz/math'
import { Entity, isTransformAnimation, isCamera } from '@luz/core'
import type { RigidPose, Camera, Component } from '@luz/core'
import type { Body, CollisionManifold } from '@luz/physics'
import { Collider, PhysicsWorld, isBiped, isBody } from '@luz/physics'

const { exp } = Math

interface SimulationSnapshot {
  entity: Entity
  translation: Vector3
  rotation: Quaternion
  scale: Vector3
}

export class Scene extends Serializable {
  *iterateEntries(): IterableIterator<[string, Entity]> {
    for (const [name, root] of Object.entries(this.entities)) {
      root.parent = undefined
      yield* root.iterateEntries(Entity.escapePath(name))
    }
  }

  collectEntities(): Entity[] {
    return Array.from(this.iterateEntries(), ([, entity]) => entity)
  }

  findEntity(path: string): Entity | undefined {
    if (this.entities[path]) {
      return this.entities[path]
    }

    return Array.from(this.iterateEntries()).find(([key]) => key === path)?.[1]
  }

  updateTransforms(): void {
    for (const [, entity] of this.iterateEntries()) {
      entity.updateTransform()
    }
  }

  selectCamera(): { entity: Entity; camera: Camera } {
    const findCameras = (entity: Entity) => Object.values(entity.components).filter(isCamera)
    const root = this.entities.Camera
    const preferredCameras = root && findCameras(root)

    if (preferredCameras?.length === 1) {
      return { entity: root, camera: preferredCameras[0] }
    }

    const candidates = this.collectEntities().flatMap((entity) =>
      findCameras(entity).map((camera) => ({ entity, camera }))
    )

    if (candidates.length !== 1) {
      throw new Error(
        `Expected one camera or a root named 'Camera'; found ${candidates.length} cameras. Name the desired root 'Camera'.`
      )
    }

    return candidates[0]
  }

  @Serialize()
  environment?: Required<EnvironmentDefinition>

  @Serialize()
  readonly gravity: Vector3

  @Serialize()
  readonly linearDamping: number = 0.02

  @Serialize()
  readonly angularDamping: number = 0.05

  @Serialize(Entity)
  readonly entities: Record<string, Entity> = {}

  @Serialize(Collider)
  readonly colliders: Record<string, Collider> = {}

  readonly physics = new PhysicsWorld()
  get collisionManifolds(): readonly CollisionManifold[] {
    return this.physics.collisionManifolds
  }

  @Serialize()
  fixedTimeStep = 1 / 60

  @Serialize()
  maximumSubsteps = 4

  @Serialize()
  synchronizationPolicy: SynchronizationPolicy = 'drop'

  droppedSimulationTime = 0
  get interpolationAlpha(): number {
    return Math.min(1, this.elapsedTime / this.fixedTimeStep)
  }
  private readonly previousPhysicsPoses = new Map<Entity, RigidPose>()
  private readonly poseEntities = new Set<Entity>()

  interpolatePose(entity: Entity): RigidPose {
    const previousPose = this.previousPhysicsPoses.get(entity)

    if (!previousPose) {
      return { translation: entity.translation.clone(), rotation: entity.rotation.clone() }
    }

    const alpha = this.interpolationAlpha
    const translation = Vector3.scale(previousPose.translation, 1 - alpha).add(Vector3.scale(entity.translation, alpha))

    let dot = 0

    for (let index = 0; index < 4; index++) {
      dot += previousPose.rotation[index] * entity.rotation[index]
    }

    const rotation = new Quaternion()

    for (let index = 0; index < 4; index++) {
      rotation[index] = previousPose.rotation[index] * (1 - alpha) + entity.rotation[index] * alpha * (dot < 0 ? -1 : 1)
    }

    return { translation, rotation: rotation.normalize() }
  }

  private wasPhysicsEnabled = false
  private elapsedTime: number = 0
  private simulationState: SimulationSnapshot[] = []

  get collisionStatistics() {
    return this.physics.collisionStatistics
  }

  constructor() {
    super()

    this.gravity = new Vector3([0, -9.81, 0])
  }

  static async deserialize(data: unknown): Promise<Scene> {
    const definition = { ...readDefinition(data, 'Scene') }

    for (const key of ['entities', 'colliders']) {
      if (definition[key] !== undefined) {
        readDefinition(definition[key], `Scene ${key}`)
      }
    }

    if (definition.environment !== undefined) {
      const environment = readDefinition(definition.environment, 'Scene environment')

      for (const key of ['sky', 'radiance', 'irradiance']) {
        if (typeof environment[key] !== 'string' || !environment[key]) {
          throw new Error(`Scene environment ${key} must be a nonempty string`)
        }
      }

      if (
        environment.rotation !== undefined &&
        (typeof environment.rotation !== 'number' || !Number.isFinite(environment.rotation))
      ) {
        throw new Error('Scene environment rotation must be finite')
      }

      definition.environment = { ...environment, rotation: environment.rotation ?? 0 }
    }

    const scene = (await super.deserialize(definition)) as Scene

    scene.validateSimulationSettings()

    for (const [name, entity] of Object.entries(scene.entities)) {
      entity.validateHierarchy(name)
    }

    scene.updateTransforms()
    scene.captureSimulationState()

    return scene
  }

  private validateSimulationSettings(): void {
    if (
      !Number.isFinite(this.linearDamping) ||
      this.linearDamping < 0 ||
      !Number.isFinite(this.angularDamping) ||
      this.angularDamping < 0
    ) {
      throw new Error('Scene damping must be finite and nonnegative')
    }

    if (
      !Number.isFinite(this.fixedTimeStep) ||
      this.fixedTimeStep <= 0 ||
      !Number.isInteger(this.maximumSubsteps) ||
      this.maximumSubsteps <= 0 ||
      !['drop', 'retain'].includes(this.synchronizationPolicy)
    ) {
      throw new Error('Invalid fixed-step configuration')
    }
  }

  captureSimulationState() {
    this.simulationState = this.collectEntities()
      .filter((entity) =>
        Object.values(entity.components).some((component) => isBody(component) || isTransformAnimation(component))
      )
      .map((entity) => ({
        entity,
        translation: entity.translation.clone(),
        rotation: entity.rotation.clone(),
        scale: entity.scale.clone()
      }))

    for (const { entity } of this.simulationState) {
      entity.validateHierarchy()
      entity.animationMixer?.reset()
    }
  }

  resetSimulation() {
    this.elapsedTime = 0
    this.droppedSimulationTime = 0

    this.previousPhysicsPoses.clear()
    this.poseEntities.clear()
    this.physics.reset()
    this.simulationState.forEach(({ entity, translation, rotation, scale }) => {
      entity.translation.set(translation)
      entity.rotation.set(rotation)
      entity.scale.set(scale)
      entity.updateTransform()
      entity.animationMixer?.reset()
      Object.values(entity.components).forEach((component) => {
        if (!isBody(component)) {
          return
        }

        component.resetMotion()
        component.applyTransform(entity)

        if (isBiped(component)) {
          component.isGrounded = false
        }
      })
    })
    this.updateTransforms()
  }

  previewAnimations(entities: Entity[]): void {
    for (const entity of entities) {
      entity.animationMixer?.applyPose(entity, 0)

      for (const body of Object.values(entity.components).filter(isBody)) {
        body.resetMotion()
        body.applyTransform(entity)
      }
    }

    this.previousPhysicsPoses.clear()
    this.updateTransforms()

    for (const entity of this.collectEntities()) {
      entity.update(0)
    }
  }

  update(deltaTime: number, isPhysicsEnabled: boolean = true) {
    if (!Number.isFinite(deltaTime) || deltaTime < 0) {
      throw new Error('Scene delta time must be finite and nonnegative')
    }

    if (this.gravity.xyz.some((value) => !Number.isFinite(value))) {
      throw new Error('Gravity must be finite')
    }

    this.updateTransforms()

    const sceneEntities = this.collectEntities()

    if (isPhysicsEnabled !== this.wasPhysicsEnabled) {
      this.elapsedTime = 0
      this.wasPhysicsEnabled = isPhysicsEnabled

      this.previousPhysicsPoses.clear()

      for (const entity of sceneEntities) {
        if (entity.animationMixer) {
          for (const body of Object.values(entity.components).filter(isBody)) {
            body.resetMotion()
          }
        }
      }
    }

    if (!isPhysicsEnabled) {
      for (const entity of sceneEntities) {
        const mixer = entity.animationMixer

        if (mixer?.hasActiveAnimations) {
          mixer.applyPose(entity, deltaTime)
        }
      }

      this.updateTransforms()
    }

    this.validateSimulationSettings()
    this.poseEntities.clear()

    for (const entity of sceneEntities) {
      this.poseEntities.add(entity)
    }

    for (const entity of this.previousPhysicsPoses.keys()) {
      if (!this.poseEntities.has(entity)) {
        this.previousPhysicsPoses.delete(entity)
      }
    }

    if (isPhysicsEnabled) {
      this.elapsedTime += deltaTime

      if (this.synchronizationPolicy === 'drop') {
        const maximumElapsedTime = this.fixedTimeStep * this.maximumSubsteps

        this.droppedSimulationTime += Math.max(0, this.elapsedTime - maximumElapsedTime)
        this.elapsedTime = Math.min(this.elapsedTime, maximumElapsedTime)
      }
    }

    let fixedSteps = 0

    sceneEntities.forEach((entity) => {
      const hasAnimation = Object.values(entity.components).some(isTransformAnimation)

      Object.values(entity.components).forEach((component) => {
        if (isBody(component)) {
          if (!isPhysicsEnabled && hasAnimation) {
            component.resetMotion()
          }

          component.applyTransform(entity)
        }
      })
    })
    this.physics.setObjects(
      sceneEntities.flatMap((entity) => Object.values(entity.components).filter(isBody)),
      Object.values(this.colliders)
    )

    while (isPhysicsEnabled && this.elapsedTime >= this.fixedTimeStep && fixedSteps++ < this.maximumSubsteps) {
      const components = sceneEntities.reduce<Component[]>((components, entity) => {
        return [...components, ...Object.values(entity.components)]
      }, [])

      const bodies = components.filter(isBody)

      // Capture the old poses before any animation runs. Animation targets must
      // expose their velocities before prepare wakes sleeping contact islands.
      for (const entity of sceneEntities) {
        const previousPose = this.previousPhysicsPoses.get(entity)

        if (previousPose) {
          entity.translation.copyTo(previousPose.translation)
          entity.rotation.copyTo(previousPose.rotation)
        } else {
          this.previousPhysicsPoses.set(entity, {
            translation: entity.translation.clone(),
            rotation: entity.rotation.clone()
          })
        }

        const entityBodies = Object.values(entity.components).filter(isBody)

        const mixer = entity.animationMixer

        if (mixer?.hasActiveAnimations) {
          if (entityBodies.length) {
            const pose = mixer.advance(this.fixedTimeStep)

            for (const body of entityBodies) {
              body.setKinematicTarget(pose.translation, pose.rotation, this.fixedTimeStep)
            }
          } else {
            mixer.applyPose(entity, this.fixedTimeStep)
          }
        }
      }

      this.updateTransforms()
      this.physics.prepare(bodies, Object.values(this.colliders), this.gravity)
      this.applyGravity(bodies)
      this.applyDamping(bodies, this.fixedTimeStep)
      sceneEntities.forEach((entity) => {
        entity.updateTransform()
        entity.performFixedUpdate(this.fixedTimeStep)
      })
      this.physics.solve(bodies, Object.values(this.colliders), this.fixedTimeStep)
      this.updateTransforms()

      this.elapsedTime -= this.fixedTimeStep
    }

    this.updateTransforms()
    sceneEntities.forEach((entity) => {
      entity.update(deltaTime)
    })
  }

  private applyGravity(bodies: Body[]) {
    const force = new Vector3()

    bodies.forEach((body) => {
      if (!body.isDynamic || body.isSleeping) {
        return
      }

      Vector3.scale(this.gravity, body.mass, force)
      body.force.add(force)
    })
  }

  private applyDamping(bodies: Body[], deltaTime: number) {
    const hasLinearDamping = this.linearDamping > 0
    const hasAngularDamping = this.angularDamping > 0

    if (!hasLinearDamping && !hasAngularDamping) {
      return
    }

    const linearDampingFactor = hasLinearDamping ? exp(-this.linearDamping * deltaTime) : 1
    const angularDampingFactor = hasAngularDamping ? exp(-this.angularDamping * deltaTime) : 1

    bodies.forEach((body) => {
      if (!body.isDynamic || body.isSleeping) {
        return
      }

      if (hasLinearDamping) {
        body.linearVelocity.scale(linearDampingFactor)
      }

      if (hasAngularDamping) {
        body.angularVelocity.scale(angularDampingFactor)
      }
    })
  }
}
