// Avoid the graphics barrel: loaders import core, and decorators need these classes immediately.
import { Component, Transform } from '@luz/core'
import { GeometryReference } from '@luz/formats'
import type { AnimationReferences, SkeletalDocument } from '@luz/formats'
import { Serialize, Uniform, Register } from '@luz/serialization'
import { SkeletalAnimation } from './renderer/skeletal-animation'
import { SkeletalMixer } from './skeletal-mixer'
import { Armature } from './renderer/armature'
import { Material } from './renderer/material'
import { Mesh } from './renderer/mesh'

export type { ModelDefinition } from '@luz/formats'

export interface ModelOptions {
  meshes?: Readonly<Record<string, Mesh>>
  materials?: Readonly<Record<string, Material>>
}

@Register('model')
export class Model extends Component {
  readonly type = 'model'
  readonly timestep: Component.Timestep = 'variable'

  @Serialize()
  isVisible: boolean = true

  @Serialize(Material)
  readonly materials: Record<string, Material> = {}

  @Serialize(Mesh)
  readonly meshes: Readonly<Record<string, Mesh>> = {}

  @Serialize()
  readonly geometry?: GeometryReference

  @Serialize(Armature)
  readonly armatures: Record<string, Armature> = {}

  private readonly animationClips: Record<string, SkeletalAnimation> = {}

  readonly animationMixer = new SkeletalMixer(this.animationClips, () => this.applyPose())

  get animations(): Readonly<Record<string, Readonly<SkeletalAnimation>>> {
    return this.animationClips
  }

  boneMatrices?: Float32Array

  private animationReferences?: AnimationReferences

  @Uniform()
  isAnimated: boolean = false

  constructor({ meshes, materials }: ModelOptions = {}) {
    super()

    this.meshes = { ...meshes }
    this.materials = { ...materials }
  }

  setMesh(name: string, mesh: Mesh): void {
    mesh.invalidateGeometry()
    Object.defineProperty(this.meshes, name, { value: mesh, enumerable: true, configurable: true, writable: true })
  }

  removeMesh(name: string): void {
    Reflect.deleteProperty(this.meshes, name)
  }

  serialize(): Record<string, unknown> {
    const data = super.serialize()

    if (this.animationReferences !== undefined) {
      data.animations = { ...this.animationReferences }
    }

    return data
  }

  static validateAnimationReferences(references: unknown): asserts references is AnimationReferences | undefined {
    if (references === undefined) {
      return
    }

    if (!references || typeof references !== 'object' || Array.isArray(references)) {
      throw new Error('Model animations must be a map of document references')
    }

    for (const [name, reference] of Object.entries(references)) {
      if (typeof reference !== 'string' || !reference.trim()) {
        throw new Error(`Animation '${name}' must reference an animation document; embedded clips are unsupported`)
      }
    }
  }

  static async deserialize(data: unknown, resolvedAnimations: Record<string, SkeletalDocument> = {}): Promise<Model> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Model requires an object definition')
    }

    const references = 'animations' in data ? data.animations : undefined

    Model.validateAnimationReferences(references)

    const model = (await super.deserialize(data)) as Model
    const bones = Object.values(model.armatures).flatMap((armature) => armature.bones)

    model.animationReferences = references === undefined ? undefined : { ...references }

    for (const [name, reference] of Object.entries(references ?? {})) {
      try {
        if (!Object.prototype.hasOwnProperty.call(resolvedAnimations, name)) {
          throw new Error('Unresolved animation reference; use ModelLoader before deserialization')
        }

        const animation = await SkeletalAnimation.deserialize(resolvedAnimations[name])

        if (
          bones.length === 0 ||
          Object.keys(animation.keyframes).some((boneName) => !bones.some((bone) => bone.name === boneName)) ||
          bones.some((bone) => !animation.keyframes[bone.name])
        ) {
          throw new Error('Skeletal animation tracks must match the skeleton')
        }

        Object.defineProperty(model.animationClips, name, {
          value: animation,
          enumerable: true,
          writable: true,
          configurable: true
        })
      } catch (error) {
        throw new Error(
          `Animation '${name}' ('${reference}'): ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    if (Object.values(model.armatures).length > 1) {
      throw new Error('A skinned model must contain one skeleton')
    }

    if (Object.values(model.armatures).length && !bones.length) {
      throw new Error('A skeleton must contain at least one bone')
    }

    for (const mesh of Object.values(model.meshes)) {
      const vertexCount = 'count' in mesh.vertices ? mesh.vertices.count : mesh.vertices.length / 8
      const vertices = new Set<number>()

      for (const entry of mesh.weights) {
        if (
          !Number.isInteger(entry.vertex) ||
          entry.vertex < 0 ||
          entry.vertex >= vertexCount ||
          vertices.has(entry.vertex) ||
          entry.indices.length !== 4 ||
          entry.weights.length !== 4 ||
          entry.indices.some((index) => !Number.isInteger(index) || index < 0 || index >= bones.length) ||
          entry.weights.some((weight) => !Number.isFinite(weight) || weight < 0 || weight > 1)
        ) {
          throw new Error('Invalid skeletal vertex weights or bone indices')
        }

        const totalWeight = entry.weights.reduce((total, weight) => total + weight, 0)

        if (totalWeight !== 0 && Math.abs(totalWeight - 1) > 1e-5) {
          throw new Error('Skeletal vertex weights must sum to one or zero')
        }

        vertices.add(entry.vertex)
      }
    }

    if (Object.values(model.armatures).length > 0) {
      model.boneMatrices = new Float32Array(16 * bones.length)
      model.isAnimated = true

      model.update(new Transform(), 0)
    }

    return model
  }

  update(_transform: Transform, deltaTime: number): void {
    this.animationMixer.advance(deltaTime)
    this.applyPose(deltaTime)
  }

  private applyPose(deltaTime = 0): void {
    const animations = Object.values(this.animationClips)

    const armatures = Object.values(this.armatures)

    armatures.forEach((armature) => {
      armature.update(
        deltaTime,
        animations.filter((animation) => animation.state !== 'stopped' && animation.weight > 0)
      )
    })
    armatures
      .flatMap((armature) => armature.bones)
      .forEach((bone, index) => {
        this.boneMatrices?.set(bone.poseMatrix, index * 16)
      })
  }
}

export const isModel = (component: Component): component is Model => {
  return component.type === 'model'
}
