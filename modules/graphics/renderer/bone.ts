import { Serialize, Serializable } from '@luz/utilities'
import { vec3, mat4, quat } from '@luz/vectors'
import { Keyframe } from './keyframe'
import { Animation } from './animation'
import { Transform } from '@luz/core'

export class Bone extends Serializable {
  @Serialize()
  readonly name: string = ''

  @Serialize()
  readonly parent: string = ''

  @Serialize()
  readonly head: vec3 = vec3.zero.copy()

  @Serialize()
  readonly tail: vec3 = vec3.zero.copy()

  @Serialize()
  readonly bindMatrix: mat4 = mat4.identity.copy()

  parentBone: Bone | null = null

  readonly childBones: Bone[] = []

  readonly poseMatrix: mat4 = mat4.identity.copy()

  readonly localMatrix: mat4 = mat4.identity.copy()

  readonly inverseBindMatrix: mat4 = mat4.identity.copy()

  // Global (object-space) pose without skinning (used for hierarchy propagation)
  readonly globalMatrix: mat4 = mat4.identity.copy()

  constructor({ name, parent, head, tail, bindMatrix }: Partial<Bone> = {}) {
    super()

    if (name) {
      this.name = name
    }

    if (head) {
      this.head.set(head)
    }

    if (tail) {
      this.tail.set(tail)
    }

    if (parent) {
      this.parent = parent
    }

    if (bindMatrix) {
      this.bindMatrix.set(bindMatrix)
      this.bindMatrix.invert(this.inverseBindMatrix)
    }
  }

  update(deltaTime: number, animations: Animation[]) {
    const transforms = animations.map((animation) => {
      return this.transform(animation)
    })

    const weights = animations.map(({ weight }) => weight)

    const transform = this.blendTransforms(transforms, weights)

    const { translation, rotation, scale } = transform

    mat4.construct(translation, rotation, scale, this.localMatrix)

    // First, build hierarchical global pose (object/model space) without skinning
    if (this.parentBone) {
      const { globalMatrix } = this.parentBone

      mat4.multiply(this.localMatrix, globalMatrix, this.globalMatrix) // global = parentGlobal * local
    } else {
      this.globalMatrix.copy(this.localMatrix)
    }

    // Then compute final skin matrix: global pose * inverse bind
    mat4.multiply(this.inverseBindMatrix, this.globalMatrix, this.poseMatrix)

    this.childBones.forEach((bone) => bone.update(deltaTime, animations))
  }

  private transform(animation: Animation) {
    const keyframes = animation.keyframes[this.name]

    if (!keyframes) {
      throw new Error(`Missing keyframes for bone: ${this.name}`)
    }

    const { time } = animation
    const { translation, rotation, scale } = keyframes

    return new Transform({
      translation: this.interpolateKeyframes(time, translation, vec3.interpolate),
      rotation: this.interpolateKeyframes(time, rotation, quat.interpolate),
      scale: this.interpolateKeyframes(time, scale, vec3.interpolate)
    })
  }

  private interpolateKeyframes<T extends vec3 | quat>(
    time: number,
    keyframes: Keyframe<T>[],
    interpolate: (v1: T, v2: T, t: number) => T
  ) {
    for (let i = 0; i < keyframes.length - 1; i++) {
      const { time: t1, value: v1 } = keyframes[i]
      const { time: t2, value: v2 } = keyframes[i + 1]

      if (time >= t1 && time <= t2) {
        return interpolate(v1, v2, (time - t1) / (t2 - t1))
      }
    }

    return keyframes[keyframes.length - 1].value
  }

  private blendTransforms(transforms: Transform[], weights: number[]) {
    if (transforms.length === 0) {
      return Transform.origin
    }

    const totalWeight = weights.reduce((total, weight) => {
      return total + weight
    }, 0)

    if (totalWeight === 0) {
      return Transform.origin
    }

    weights = weights.map((weight) => weight / totalWeight)

    const translation: vec3 = vec3.zero.copy()
    const scale: vec3 = vec3.zero.copy()

    transforms.forEach((transform, index) => {
      const weight = weights[index]

      translation.add(vec3.scale(transform.translation, weight))
      scale.add(vec3.scale(transform.scale, weight))
    })

    const rotation: quat = transforms[0].rotation.copy()

    transforms.forEach((transform, index) => {
      const weight = weights[index]

      quat.interpolate(rotation, transform.rotation, weight, rotation)
    })

    return new Transform({ translation, rotation, scale })
  }
}
