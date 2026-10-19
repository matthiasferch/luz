import { expect } from 'chai'
import type { Transform } from '@luz/core'
import { TransformAnimation, Entity, Pose } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import { Body, Sphere } from '@luz/physics'
import { Scene } from '@luz/scene'

const createAnimation = (distance = 2): TransformAnimation => {
  const animation = new TransformAnimation()

  animation.isAutoplayEnabled = true
  animation.duration = 1
  animation.playback = 'once'
  animation.tracks = {
    translation: [
      { time: 0, value: [0, 0, 0] },
      { time: 1, value: [distance, 0, 0] }
    ],
    rotation: [
      { time: 0, value: [0, 0, 0, 1] },
      { time: 1, value: Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI / 2).serialize() }
    ],
    scale: [
      { time: 0, value: [1, 1, 1] },
      { time: 1, value: [2, 3, 4] }
    ]
  }

  return animation
}

const getPoseValues = (pose: Pick<Transform, 'translation' | 'rotation' | 'scale'>): number[] => {
  return [...pose.translation, ...pose.rotation, ...pose.scale]
}

const createKinematicScene = (distance = 2) => {
  const scene = new Scene()
  const entity = new Entity()
  const body = new Body()
  const animation = createAnimation(distance)

  delete animation.tracks.scale

  scene.fixedTimeStep = 0.25
  body.motionType = 'kinematic'
  body.volume = new Sphere({ origin: new Vector3([0.2, 0, 0]) })
  entity.components.body = body
  entity.components.animation = animation
  scene.entities.platform = entity

  scene.captureSimulationState()

  return { scene, entity, body, animation }
}

describe('Object animation scratch ownership', () => {
  it('samples into caller-owned destinations and keeps animation definitions unchanged', async () => {
    const animation = createAnimation()
    const destination = new Pose()
    const definition = animation.serialize()

    expect(animation.sample(0.25, destination)).to.equal(destination)
    expect(destination.translation.x).to.equal(0.5)

    const snapshot = getPoseValues(destination)
    const otherDestination = new Pose()

    animation.sample(0.75, otherDestination)
    expect(getPoseValues(destination)).to.deep.equal(snapshot)
    expect(animation.serialize()).to.deep.equal(definition)
    expect((await TransformAnimation.deserialize(definition)).serialize()).to.deep.equal(definition)
  })
  it('reuses mixer-owned poses while keeping different entities independent', () => {
    const firstScene = createKinematicScene()
    const secondScene = createKinematicScene(8)
    const mixer = firstScene.entity.animationMixer!
    const pose = mixer.advance(0.25)
    const snapshot = getPoseValues(pose)

    secondScene.entity.animationMixer!.advance(0.5)
    expect(getPoseValues(pose)).to.deep.equal(snapshot)
    expect(mixer.advance(0.25)).to.equal(pose)
    expect(pose.translation.x).to.equal(1)
    mixer.stop()
    expect(firstScene.entity.translation.xyz).to.deep.equal([0, 0, 0])
  })
  it('does not partially write transforms when sampling fails', () => {
    const { entity, animation } = createKinematicScene()
    const mixer = entity.animationMixer!
    const snapshot = getPoseValues(entity)
    const sampleAnimation = animation.sample

    animation.sample = () => {
      throw new Error('sampling failed')
    }

    expect(() => mixer.applyPose(entity, 0.25)).to.throw('sampling failed')
    expect(getPoseValues(entity)).to.deep.equal(snapshot)

    animation.sample = sampleAnimation

    expect(() => mixer.applyPose(entity, -1)).to.throw('delta time')
    mixer.applyPose(entity, 0.25)
    expect(entity.translation.x).to.equal(1)
  })
  it('preserves a kinematic target through nested updates of another scene', () => {
    const outerScene = createKinematicScene()
    const nestedScene = createKinematicScene(8)
    const setKinematicTarget = outerScene.body.setKinematicTarget

    outerScene.body.setKinematicTarget = function (translation, rotation, deltaTime) {
      const snapshot = [...translation, ...rotation]

      nestedScene.scene.update(deltaTime)
      expect([...translation, ...rotation]).to.deep.equal(snapshot)
      setKinematicTarget.call(this, translation, rotation, deltaTime)
    }

    outerScene.scene.update(0.25)
    expect(outerScene.entity.translation.x).to.equal(0.5)
    expect(nestedScene.entity.translation.x).to.equal(2)
    outerScene.scene.resetSimulation()
    expect(outerScene.entity.translation.xyz).to.deep.equal([0, 0, 0])
  })
})
