import { expect } from 'chai'
import { Quaternion } from '@luz/math'

describe('Quaternion Euler angles', () => {
  it('round trips the convention used by setFromEulerAngles', () => {
    const rotation = Quaternion.setFromEulerAngles(0.7, -0.4, 0.2)

    expect(rotation.yaw).to.be.closeTo(0.7, 1e-6)
    expect(rotation.pitch).to.be.closeTo(-0.4, 1e-6)
    expect(rotation.roll).to.be.closeTo(0.2, 1e-6)
  })
  it('preserves yaw angles beyond ninety degrees', () => {
    const yaw = Math.PI * 0.75
    const rotation = Quaternion.setFromEulerAngles(yaw, 0.2, 0)

    expect(rotation.yaw).to.be.closeTo(yaw, 1e-6)
    expect(rotation.pitch).to.be.closeTo(0.2, 1e-6)
  })
  it('extracts angles from a non-unit representation of the same rotation', () => {
    const rotation = Quaternion.setFromEulerAngles(-1.2, 0.35, -0.15)

    rotation.set(Array.from(rotation, (value) => value * 2))
    expect(rotation.yaw).to.be.closeTo(-1.2, 1e-6)
    expect(rotation.pitch).to.be.closeTo(0.35, 1e-6)
    expect(rotation.roll).to.be.closeTo(-0.15, 1e-6)
  })
})
