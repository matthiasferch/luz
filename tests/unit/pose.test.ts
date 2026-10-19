import { expect } from 'chai'
import { Pose, Transform } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'

describe('Pose', () => {
  it('creates independent identity poses without transform hierarchy or matrix state', () => {
    const pose = new Pose()
    const otherPose = new Pose()

    expect([...pose.translation]).to.deep.equal([0, 0, 0])
    expect([...pose.rotation]).to.deep.equal([0, 0, 0, 1])
    expect([...pose.scale]).to.deep.equal([1, 1, 1])
    expect(Object.keys(pose)).to.deep.equal(['translation', 'rotation', 'scale'])

    pose.translation.x = 4
    pose.rotation.w = 0
    pose.scale.y = 3

    expect(otherPose.translation.x).to.equal(0)
    expect(otherPose.rotation.w).to.equal(1)
    expect(otherPose.scale.y).to.equal(1)
  })
  it('copies transforms and poses without sharing vectors or replacing reusable storage', () => {
    const transform = new Transform({
      translation: new Vector3([1, 2, 3]),
      rotation: Quaternion.setFromAxisAngle(Vector3.createUp(), 0.5),
      scale: new Vector3([2, 3, 4])
    })
    const pose = new Pose().copyFrom(transform)
    const destination = new Pose()
    const translation = destination.translation

    expect(pose.copyTo(destination)).to.equal(destination)
    expect(destination.translation).to.equal(translation)
    expect([...destination.translation]).to.deep.equal([1, 2, 3])
    expect([...destination.rotation]).to.deep.equal([...transform.rotation])
    expect([...destination.scale]).to.deep.equal([2, 3, 4])

    const copy = pose.clone()

    transform.translation.x = 8
    pose.translation.y = 9

    expect(copy.translation).not.to.equal(pose.translation)
    expect([...copy.translation]).to.deep.equal([1, 2, 3])
    expect([...destination.translation]).to.deep.equal([1, 2, 3])
  })
  it('resets to identity in place, including unit scale and quaternion', () => {
    const pose = new Pose()
    const translation = pose.translation
    const rotation = pose.rotation
    const scale = pose.scale

    pose.translation.set([1, 2, 3])
    pose.rotation.set([1, 0, 0, 0])
    pose.scale.set([2, 3, 4])
    expect(pose.reset()).to.equal(pose)
    expect(pose.translation).to.equal(translation)
    expect(pose.rotation).to.equal(rotation)
    expect(pose.scale).to.equal(scale)
    expect([...translation]).to.deep.equal([0, 0, 0])
    expect([...rotation]).to.deep.equal([0, 0, 0, 1])
    expect([...scale]).to.deep.equal([1, 1, 1])
  })
})
