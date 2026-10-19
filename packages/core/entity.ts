import type { MotionType } from '@luz/formats'
import { Serialize, readDefinition } from '@luz/serialization'
import { Transform } from './transform'
import { Component } from './component'
import { AnimationMixer } from './animation-mixer'
import { isTransformAnimation, type TransformAnimation } from './components/transform-animation'

type PhysicsComponent = Component & {
  motionType: MotionType
}

const isPhysicsComponent = (component: Component): component is PhysicsComponent => {
  return component.type === 'body' || component.type === 'biped'
}

export class Entity extends Transform {
  private mixer?: AnimationMixer

  get animationMixer(): AnimationMixer | undefined {
    const animations = Object.fromEntries(
      Object.entries(this.components).filter(([, component]) => isTransformAnimation(component))
    ) as Record<string, TransformAnimation>

    if (!this.mixer && Object.keys(animations).length) {
      this.mixer = new AnimationMixer(this, animations)
    } else {
      this.mixer?.refresh(animations)
    }

    return this.mixer
  }

  @Serialize(Component)
  readonly components: Record<string, Component> = {}

  declare parent?: Entity

  @Serialize(Entity)
  readonly children: Record<string, Entity> = {}

  static escapePath(name: string): string {
    return name.replace(/~/g, '~0').replace(/\//g, '~1')
  }

  *iterateEntries(path = ''): IterableIterator<[string, Entity]> {
    yield [path, this]

    for (const [name, child] of Object.entries(this.children)) {
      child.parent = this
      yield* child.iterateEntries(`${path}/${Entity.escapePath(name)}`)
    }
  }

  validateHierarchy(path = '', isNested = false): void {
    const animations = Object.values(this.components).filter(isTransformAnimation)

    for (const animation of animations) {
      animation.validate()

      for (const body of Object.values(this.components).filter(isPhysicsComponent)) {
        if (body.motionType !== 'kinematic') {
          throw new Error(`Animated body '${path}' must be kinematic`)
        }

        if (animation.hasScaleChanges) {
          throw new Error(`Animated body '${path}' cannot change scale: collider dimensions are baked`)
        }
      }
    }

    if (isNested && Object.values(this.components).some(isPhysicsComponent)) {
      throw new Error(
        `Entity '${path}' has a nested physics body. Move the body to a scene/asset root; use children only for visuals, cameras and lights.`
      )
    }

    for (const [name, child] of Object.entries(this.children)) {
      child.parent = this

      child.validateHierarchy(`${path}/${Entity.escapePath(name)}`, true)
    }
  }

  static validateDefinition(data: unknown): void {
    const definition = readDefinition(data, 'Entity')
    const components =
      definition.components === undefined ? {} : readDefinition(definition.components, 'Entity components')

    if (definition.children !== undefined) {
      readDefinition(definition.children, 'Entity children')
    }

    if (
      Object.values(components).some(
        (component) =>
          component !== null && typeof component === 'object' && 'type' in component && component.type === 'polygon'
      )
    ) {
      throw new Error('Attached polygon colliders are unsupported; use scene-level static colliders or a root body')
    }

    for (const [key, size] of [
      ['translation', 3],
      ['rotation', 4],
      ['scale', 3]
    ] as const) {
      const raw = definition[key]

      if (raw === undefined) {
        continue
      }

      const values =
        Array.isArray(raw) || raw instanceof Float32Array || raw instanceof Float64Array ? Array.from(raw) : []

      if (values.length !== size || values.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
        throw new Error(`Invalid entity ${key}: expected ${size} finite numbers`)
      }

      if (key === 'scale' && values.some((value) => Math.abs(value) < 1e-8)) {
        throw new Error('Entity scale is singular')
      }

      if (key === 'rotation' && Math.abs(Math.hypot(...values) - 1) > 1e-4) {
        throw new Error('Entity rotation must be a unit quaternion')
      }
    }
  }

  static async deserialize(data: unknown): Promise<Entity> {
    const definition = readDefinition(data, 'Entity')

    if (definition.entity !== undefined) {
      throw new Error('Use EntityLoader to resolve entity asset references')
    }

    if (definition.colliders !== undefined) {
      throw new Error('Attached polygon colliders are unsupported; use scene-level static colliders or a root body')
    }

    Entity.validateDefinition(data)

    const entity = (await super.deserialize(data)) as Entity

    entity.validateHierarchy()

    for (const [, descendant] of entity.iterateEntries()) {
      descendant.updateTransform()
    }

    return entity
  }

  update(deltaTime: number) {
    super.update(deltaTime)
    Object.values(this.components).forEach((component) => {
      if (component.timestep === 'variable') {
        component.update(this, deltaTime)
      }
    })
  }

  performFixedUpdate(deltaTime: number) {
    Object.values(this.components).forEach((component) => {
      if (component.timestep === 'fixed') {
        component.update(this, deltaTime)
      }
    })
  }
}
