import { Pool, Serialize, Serializable } from '@luz/serialization'
import { Vector3, Matrix4, Quaternion } from '@luz/math'
import type { AnimationKeyframe } from '@luz/formats'
import type { SkeletalAnimation } from './skeletal-animation'
import { Pose } from '@luz/core'

const poses = new Pool({
  createObject: () => new Pose(),

  resetObject: (pose) => pose.reset(),
  initialCapacity: 8
})

export interface BoneOptions {
  name?: string
  parent?: string
  head?: ArrayLike<number>
  tail?: ArrayLike<number>
  bindMatrix?: ArrayLike<number>
}

export class Bone extends Serializable {
  @Serialize()
  readonly name: string = ''

  @Serialize()
  readonly parent: string = ''

  @Serialize()
  readonly head: Vector3 = Vector3.createZero()

  @Serialize()
  readonly tail: Vector3 = Vector3.createZero()

  @Serialize()
  readonly bindMatrix: Matrix4 = Matrix4.createIdentity()

  parentBone: Bone | null = null

  readonly childBones: Bone[] = []
  readonly poseMatrix: Matrix4 = Matrix4.createIdentity()
  readonly localMatrix: Matrix4 = Matrix4.createIdentity()
  readonly inverseBindMatrix: Matrix4 = Matrix4.createIdentity()
  readonly globalMatrix: Matrix4 = Matrix4.createIdentity()

  constructor({ name, parent, head, tail, bindMatrix }: BoneOptions = {}) {
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

  static async deserialize(data: unknown): Promise<Bone> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Bone requires an object definition')
    }

    const definition = data as Record<string, unknown>

    if (
      definition.bindMatrix !== undefined &&
      (!Array.isArray(definition.bindMatrix) ||
        definition.bindMatrix.length !== 16 ||
        !definition.bindMatrix.every(Number.isFinite))
    ) {
      throw new Error(`Invalid bind matrix for bone ${String(definition.name)}`)
    }

    const bone = (await super.deserialize(data)) as Bone

    if (!Number.isFinite(bone.bindMatrix.determinant) || bone.bindMatrix.determinant === 0) {
      throw new Error(`Singular bind matrix for bone ${bone.name}`)
    }

    bone.bindMatrix.invert(bone.inverseBindMatrix)

    if (!Array.from(bone.inverseBindMatrix).every(Number.isFinite)) {
      throw new Error(`Non-finite inverse bind matrix for bone ${bone.name}`)
    }

    return bone
  }

  update(deltaTime: number, animations: SkeletalAnimation[]) {
    if (!animations.some((animation) => animation.weight > 0)) {
      this.bindMatrix.copyTo(this.globalMatrix)
      this.poseMatrix.reset()

      if (this.parentBone) {
        Matrix4.multiply(this.parentBone.inverseBindMatrix, this.bindMatrix, this.localMatrix)
      } else {
        this.bindMatrix.copyTo(this.localMatrix)
      }

      this.childBones.forEach((bone) => bone.update(deltaTime, animations))

      return
    }

    poses.runInScope(() => {
      const sampledPoses = animations.map((animation) => this.sampleAnimation(animation))
      const weights = animations.map(({ weight }) => weight)
      const { translation, rotation, scale } = this.blendPoses(sampledPoses, weights)

      Matrix4.createTransform(translation, rotation, scale, this.localMatrix)
    })

    if (this.parentBone) {
      const { globalMatrix } = this.parentBone

      Matrix4.multiply(globalMatrix, this.localMatrix, this.globalMatrix)
    } else {
      this.localMatrix.copyTo(this.globalMatrix)
    }

    Matrix4.multiply(this.globalMatrix, this.inverseBindMatrix, this.poseMatrix)
    this.childBones.forEach((bone) => bone.update(deltaTime, animations))
  }

  private sampleAnimation(animation: SkeletalAnimation): Pose {
    const keyframes = animation.keyframes[this.name]

    if (!keyframes) {
      throw new Error(`Missing keyframes for bone: ${this.name}`)
    }

    const { time } = animation
    const { translation, rotation, scale } = keyframes
    const pose = poses.acquire()

    this.interpolateKeyframes(time, translation, Vector3.interpolateClamped, pose.translation)
    this.interpolateKeyframes(time, rotation, Quaternion.interpolateSpherical, pose.rotation)
    this.interpolateKeyframes(time, scale, Vector3.interpolateClamped, pose.scale)

    return pose
  }

  private interpolateKeyframes<T extends Vector3 | Quaternion>(
    time: number,
    keyframes: AnimationKeyframe<T>[],
    interpolate: (firstValue: T, secondValue: T, time: number, destination: T) => T,
    destination: T
  ): T {
    if (time <= keyframes[0].time) {
      destination.set(keyframes[0].value)

      return destination
    }

    for (let index = 0; index < keyframes.length - 1; index++) {
      const { time: firstTime, value: firstValue } = keyframes[index]
      const { time: secondTime, value: secondValue } = keyframes[index + 1]

      if (time >= firstTime && time <= secondTime) {
        return interpolate(firstValue, secondValue, (time - firstTime) / (secondTime - firstTime), destination)
      }
    }

    destination.set(keyframes[keyframes.length - 1].value)

    return destination
  }

  private blendPoses(sampledPoses: Pose[], weights: number[]): Pose {
    if (sampledPoses.length === 0) {
      return poses.acquire()
    }

    const totalWeight = weights.reduce((accumulatedWeight, weight) => {
      return accumulatedWeight + weight
    }, 0)

    if (totalWeight === 0) {
      return poses.acquire()
    }

    weights = weights.map((weight) => weight / totalWeight)

    const blendedPose = poses.acquire()
    const { translation, rotation, scale } = blendedPose

    scale.reset()
    sampledPoses.forEach((pose, index) => {
      const weight = weights[index]

      translation.add(Vector3.scale(pose.translation, weight, pose.translation))
      scale.add(Vector3.scale(pose.scale, weight, pose.scale))
    })

    const referenceRotation = sampledPoses[0].rotation

    rotation.set([0, 0, 0, 0])
    sampledPoses.forEach((pose, index) => {
      const direction =
        referenceRotation.x * pose.rotation.x +
          referenceRotation.y * pose.rotation.y +
          referenceRotation.z * pose.rotation.z +
          referenceRotation.w * pose.rotation.w <
        0
          ? -1
          : 1
      const weight = weights[index] * direction

      rotation.x += pose.rotation.x * weight
      rotation.y += pose.rotation.y * weight
      rotation.z += pose.rotation.z * weight
      rotation.w += pose.rotation.w * weight
    })
    rotation.normalize()

    return blendedPose
  }
}
