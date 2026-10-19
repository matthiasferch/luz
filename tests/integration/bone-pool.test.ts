import { expect } from 'chai'
import { SkeletalAnimation, Armature, Bone } from '@luz/graphics'
import { Matrix4, Quaternion, Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'

const createArmature = (boneCount = 4): Armature => {
  const armature = new Armature()

  for (let index = 0; index < boneCount; index++) {
    const bone = new Bone({ name: `bone${index}`, parent: index > 0 ? `bone${index - 1}` : '' })

    if (index > 0) {
      bone.parentBone = armature.bones[index - 1]

      bone.parentBone.childBones.push(bone)
    } else {
      armature.rootBones.push(bone)
    }

    armature.bones.push(bone)
  }

  return armature
}

const createAnimation = async (armature: Armature, distance = 2): Promise<SkeletalAnimation> => {
  return (await SkeletalAnimation.deserialize({
    type: 'skeletalAnimation',
    schemaVersion: 1,
    duration: 1,
    keyframes: Object.fromEntries(
      armature.bones.map(({ name }) => [
        name,
        {
          translation: [
            { time: 0, value: [0, 0, 0] },
            { time: 1, value: [distance, distance * 2, -distance] }
          ],
          rotation: [
            { time: 0, value: [0, 0, 0, 1] },
            { time: 1, value: [...Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2)] }
          ],
          scale: [
            { time: 0, value: [1, 1, 1] },
            { time: 1, value: [2, 3, 4] }
          ]
        }
      ])
    )
  })) as SkeletalAnimation
}

const getPoseValues = (pose: unknown): number[] => {
  const { translation, rotation, scale } = pose as { translation: Vector3; rotation: Quaternion; scale: Vector3 }

  return [...translation, ...rotation, ...scale]
}

describe('Bone pooling', () => {
  const acquireObject = Pool.prototype.acquire
  const releaseObject = Pool.prototype.release
  const constructMatrix = Matrix4.createTransform
  const acquiredObjects = new Set<unknown>()
  const borrowedObjects = new Set<unknown>()

  beforeEach(() => {
    acquiredObjects.clear()
    borrowedObjects.clear()

    Pool.prototype.acquire = function () {
      const object = acquireObject.call(this)

      expect(borrowedObjects.has(object)).to.equal(false)
      acquiredObjects.add(object)
      borrowedObjects.add(object)

      return object
    }
    Pool.prototype.release = function (object) {
      expect(borrowedObjects.delete(object)).to.equal(true)
      releaseObject.call(this, object)
    }
  })
  afterEach(() => {
    Pool.prototype.acquire = acquireObject
    Pool.prototype.release = releaseObject
    Matrix4.createTransform = constructMatrix
  })
  it('samples interpolated and endpoint poses without modifying stored keyframes', async () => {
    const armature = createArmature()
    const animation = await createAnimation(armature)
    const definition = animation.serialize()
    const bone = armature.bones[1]

    for (const time of [0, 0.5, 1, 1.5, -0.5]) {
      const sampleTime = Math.max(0, Math.min(1, time))
      const expectedMatrix = Matrix4.createTransform(
        new Vector3([2 * sampleTime, 4 * sampleTime, -2 * sampleTime]),
        Quaternion.setFromAxisAngle(Vector3.createForward(), (Math.PI / 2) * sampleTime),
        new Vector3([1 + sampleTime, 1 + 2 * sampleTime, 1 + 3 * sampleTime])
      )

      animation.time = time

      armature.update(1 / 60, [animation])

      for (let index = 0; index < 16; index++) {
        expect(bone.localMatrix[index]).to.be.closeTo(expectedMatrix[index], 1e-5)
      }

      expect(animation.serialize()).to.deep.equal(definition)
      expect(borrowedObjects.size).to.equal(0)
    }
  })
  it('blends weights and resets reused buffers for zero-weight and empty animation lists', async () => {
    const armature = createArmature()
    const firstAnimation = await createAnimation(armature, 2)
    const secondAnimation = await createAnimation(armature, 6)
    const bone = armature.bones[1]

    firstAnimation.time = secondAnimation.time = 0.5
    firstAnimation.weight = 1
    secondAnimation.weight = 3

    for (let frame = 0; frame < 8; frame++) {
      armature.update(1 / 60, [firstAnimation, secondAnimation])
      expect([...bone.localMatrix].slice(12, 15)).to.deep.equal([2.5, 5, -2.5])
      expect(borrowedObjects.size).to.equal(0)
    }

    firstAnimation.weight = secondAnimation.weight = 0

    armature.update(1 / 60, [firstAnimation, secondAnimation])
    expect([...bone.localMatrix]).to.deep.equal([...Matrix4.createIdentity()])
    armature.update(1 / 60, [])
    expect([...bone.localMatrix]).to.deep.equal([...Matrix4.createIdentity()])
    expect(borrowedObjects.size).to.equal(0)
  })
  it('releases parent scratch before recursion and reuses it across deep armatures', async () => {
    const armature = createArmature(64)
    const animation = await createAnimation(armature)
    const updateBone = Bone.prototype.update

    animation.time = 0.5

    for (const bone of armature.bones.slice(1)) {
      bone.update = function (deltaTime, animations) {
        expect(borrowedObjects.size).to.equal(0)
        updateBone.call(this, deltaTime, animations)
      }
    }

    const isolatedBone = new Bone({ name: armature.bones[0].name })

    isolatedBone.update(1 / 60, [animation])

    const objectCount = acquiredObjects.size

    expect(objectCount).to.be.greaterThan(0)
    armature.update(1 / 60, [animation])
    expect(acquiredObjects.size).to.equal(objectCount)
    expect(borrowedObjects.size).to.equal(0)
    armature.update(1 / 60, [animation])
    expect(acquiredObjects.size).to.equal(objectCount)
  })
  it('retains matrices and serialized bone data across reuse by another armature', async () => {
    const armature = createArmature()
    const otherArmature = createArmature()
    const animation = await createAnimation(armature)
    const bone = armature.bones[1]
    const definition = armature.serialize()
    const matrices = [bone.localMatrix, bone.globalMatrix, bone.poseMatrix]

    animation.time = 0.5

    armature.update(1 / 60, [animation])

    const snapshots = matrices.map((matrix) => [...matrix])

    for (let frame = 0; frame < 8; frame++) {
      animation.time = frame / 8

      otherArmature.update(1 / 60, [animation])
      expect(matrices.map((matrix) => [...matrix])).to.deep.equal(snapshots)
      expect(borrowedObjects.size).to.equal(0)
    }

    expect(bone.localMatrix).to.equal(matrices[0])
    expect(bone.globalMatrix).to.equal(matrices[1])
    expect(bone.poseMatrix).to.equal(matrices[2])
    expect(armature.serialize()).to.deep.equal(definition)
  })
  it('releases partially sampled poses when a clip is missing or malformed', async () => {
    const armature = createArmature()
    const animation = await createAnimation(armature)
    const incompleteAnimation = await createAnimation(armature)
    const keyframes = incompleteAnimation.keyframes.bone0

    delete incompleteAnimation.keyframes.bone0

    expect(() => armature.update(1 / 60, [animation, incompleteAnimation])).to.throw(
      'Missing keyframes for bone: bone0'
    )
    expect(acquiredObjects.size).to.be.greaterThan(0)
    expect(borrowedObjects.size).to.equal(0)

    incompleteAnimation.keyframes.bone0 = keyframes

    keyframes.scale.splice(0)
    expect(() => armature.update(1 / 60, [incompleteAnimation])).to.throw()
    expect(borrowedObjects.size).to.equal(0)
    armature.update(1 / 60, [animation])
    expect(borrowedObjects.size).to.equal(0)
  })
  it('releases blended poses if matrix construction throws', async () => {
    const armature = createArmature()
    const animation = await createAnimation(armature)

    Matrix4.createTransform = () => {
      expect(borrowedObjects.size).to.be.greaterThan(0)

      throw new Error('matrix construction failed')
    }

    expect(() => armature.update(1 / 60, [animation])).to.throw('matrix construction failed')
    expect(borrowedObjects.size).to.equal(0)

    Matrix4.createTransform = constructMatrix

    armature.update(1 / 60, [animation])
    expect(borrowedObjects.size).to.equal(0)
  })
  it('preserves an outer pose during a nested armature update', async () => {
    const armature = createArmature()
    const nestedArmature = createArmature()
    const animation = await createAnimation(armature)

    let isNestedUpdatePending = true

    animation.time = 0.5
    Matrix4.createTransform = (translation, rotation, scale, destination) => {
      if (isNestedUpdatePending) {
        const outerObjects = new Set(borrowedObjects)
        const snapshots = [...outerObjects].map(getPoseValues)

        isNestedUpdatePending = false

        nestedArmature.update(1 / 60, [animation])
        expect(borrowedObjects).to.deep.equal(outerObjects)
        expect([...outerObjects].map(getPoseValues)).to.deep.equal(snapshots)
      }

      return constructMatrix(translation, rotation, scale, destination)
    }

    armature.update(1 / 60, [animation])
    expect(borrowedObjects.size).to.equal(0)

    for (let index = 0; index < armature.bones.length; index++) {
      expect([...armature.bones[index].poseMatrix]).to.deep.equal([...nestedArmature.bones[index].poseMatrix])
    }
  })
})
