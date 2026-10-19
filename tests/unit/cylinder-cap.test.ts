import { expect } from 'chai'
import type { MotionType } from '@luz/formats'
import { Entity } from '@luz/core'
import { Body } from '@luz/physics'
import { Scene } from '@luz/scene'
import { Cylinder, Plane, collideCylinderWithCylinder } from '@luz/physics'
import { Vector3, Quaternion } from '@luz/math'

const addCylinder = (
  scene: Scene,
  name: string,
  position: number[],
  radius: number,
  height: number,
  mass: number,
  motionType: MotionType = 'dynamic'
) => {
  const entity = new Entity(),
    body = new Body({ mass, motionType })

  entity.translation.set(position)

  body.volume = new Cylinder({ radius, height })
  body.friction = 0.5
  entity.components.body = body
  scene.entities[name] = entity

  body.applyTransform(entity)

  return { entity, body, volume: body.volume as Cylinder }
}

const createFixture = (x = 0.1, y = 0.44418636) => {
  const scene = new Scene()
  const table = addCylinder(scene, 'table', [0, 0.20220636, 0], 0.40145, 0.4047, 0, 'static')
  const cup = addCylinder(scene, 'cup', [x, y, 0], 0.05043, 0.08326, 1)

  return { scene, table, cup }
}

describe('Physics: cylinder cap support', () => {
  it('spreads support across a cap and reverses normals with argument order', () => {
    const { cup, table } = createFixture()
    const contacts = collideCylinderWithCylinder(cup.volume, table.volume)!
    const reversed = collideCylinderWithCylinder(table.volume, cup.volume)!

    expect(contacts).to.have.length(4)
    expect(reversed).to.have.length(4)
    expect(new Set(contacts.map((contact) => contact.featureId)).size).to.equal(4)

    for (const contact of contacts) {
      expect(contact.contactType).to.equal('patch')
      expect(contact.isRestingContact).to.equal(true)
      expect(contact.normal.y).to.equal(-1)
      expect(contact.penetrationDepth).to.be.closeTo(0.002, 1e-6)
      expect(contact.point.y).to.be.closeTo(0.40455636, 1e-6)
      expect(
        reversed.some(
          (otherContact) =>
            Vector3.subtract(contact.point, otherContact.point).magnitude < 1e-6 && otherContact.normal.y === 1
        )
      ).to.equal(true)
    }

    expect(Math.min(...contacts.map((contact) => contact.point.x))).to.be.lessThan(cup.volume.center.x - 0.04)
    expect(Math.max(...contacts.map((contact) => contact.point.x))).to.be.greaterThan(cup.volume.center.x + 0.04)
    expect(Math.min(...contacts.map((contact) => contact.point.z))).to.be.lessThan(-0.04)
    expect(Math.max(...contacts.map((contact) => contact.point.z))).to.be.greaterThan(0.04)

    const features = contacts.map((contact) => contact.featureId).sort()

    cup.entity.translation.x += 1e-5

    cup.body.applyTransform(cup.entity)
    expect(
      collideCylinderWithCylinder(cup.volume, table.volume)!
        .map((contact) => contact.featureId)
        .sort()
    ).to.deep.equal(features)
  })
  it('clips partial support to both finite caps', () => {
    const { cup, table } = createFixture(0.42)
    const contacts = collideCylinderWithCylinder(cup.volume, table.volume)!

    expect(contacts.length).to.be.within(2, 4)
    expect(contacts.some((contact) => contact.featureId?.includes('clip:'))).to.equal(true)

    for (const { point: contact } of contacts) {
      expect(Math.hypot(contact.x, contact.z)).to.be.at.most(table.volume.radius + 1e-6)
      expect(Math.hypot(contact.x - cup.volume.center.x, contact.z)).to.be.at.most(cup.volume.radius + 1e-6)
    }
  })
  it('keeps disjoint caps separate and sideways impacts on the convex path', () => {
    const { cup, table } = createFixture(0.47)

    expect(collideCylinderWithCylinder(cup.volume, table.volume)).to.equal(null)
    cup.entity.translation.set([0.44, 0.20220636, 0])
    cup.body.applyTransform(cup.entity)

    const contacts = collideCylinderWithCylinder(cup.volume, table.volume)!

    expect(contacts).to.have.length(1)
    expect(contacts[0].normal.x).to.be.lessThan(-0.99)
    expect(contacts[0].contactType).not.to.equal('patch')
    cup.entity.translation.set([0, 0.46, 0])
    cup.body.applyTransform(cup.entity)
    expect(collideCylinderWithCylinder(cup.volume, table.volume)).to.equal(null)
  })
  it('preserves cap contacts under a common rotation and translation', () => {
    const { cup, table } = createFixture()
    const before = collideCylinderWithCylinder(cup.volume, table.volume)!
    const rotation = Quaternion.setFromEulerAngles(0.4, -0.3, 0.6),
      shift = new Vector3([2, -1, 3])

    for (const item of [cup, table]) {
      rotation.transformVector3(item.entity.translation, item.entity.translation).add(shift)
      item.entity.rotation.set(rotation)
      item.body.applyTransform(item.entity)
    }

    const after = collideCylinderWithCylinder(cup.volume, table.volume)!

    expect(after).to.have.length(4)

    for (const contact of before) {
      const expected = rotation.transformVector3(contact.point).add(shift)

      expect(after.some((otherContact) => Vector3.subtract(otherContact.point, expected).magnitude < 1e-5)).to.equal(
        true
      )
    }

    expect(Vector3.subtract(after[0].normal, rotation.transformVector3(Vector3.createDown())).magnitude).to.be.lessThan(
      1e-6
    )
  })
  it('settles the two Sala cups without persistent horizontal drift', function () {
    this.timeout(15000)

    const scene = new Scene()

    addCylinder(scene, 'table', [0.18236701, 0.20220636, -0.09677732], 0.40145, 0.4047, 0, 'static')

    const cups = [
      [0.06119655, 0.52695018, -0.02157047],
      [-0.01778983, 0.5272727, -0.17153925]
    ].map((position, index) => addCylinder(scene, 'cup' + index, position, 0.05043, 0.08326, 1))
    const starts = cups.map((cup) => cup.entity.translation.clone())

    for (let frame = 0; frame < 360; frame++) {
      scene.update(1 / 60)
    }

    cups.forEach((cup, index) => {
      expect(cup.body.isSleeping).to.equal(true)
      expect(cup.body.linearVelocity.magnitude).to.equal(0)
      expect(cup.body.angularVelocity.magnitude).to.equal(0)
      expect(
        Math.hypot(cup.entity.translation.x - starts[index].x, cup.entity.translation.z - starts[index].z)
      ).to.be.lessThan(0.001)
      expect(cup.entity.translation.y).to.be.closeTo(0.4453, 0.001)
    })
  })

  for (const tilt of [-0.06, 0.06]) {
    it('settles a cup tilted by ' + tilt + ' radians', function () {
      this.timeout(15000)

      const { scene, cup } = createFixture(0.1, 0.53)

      cup.entity.rotation.set(Quaternion.setFromEulerAngles(tilt, 0.2, tilt / 2))
      cup.body.applyTransform(cup.entity)

      for (let frame = 0; frame < 300; frame++) {
        scene.update(1 / 60)
      }

      expect(cup.body.isSleeping).to.equal(true)
      expect(cup.volume.axes[2].y).to.be.greaterThan(0.999)
      expect(Math.hypot(cup.entity.translation.x - 0.1, cup.entity.translation.z)).to.be.lessThan(0.02)
    })
  }

  it('slows an initially sliding cup instead of sustaining its motion', function () {
    this.timeout(15000)

    const { scene, cup } = createFixture(0.1)

    cup.body.linearVelocity.z = 0.15

    for (let frame = 0; frame < 300; frame++) {
      scene.update(1 / 60)
    }

    expect(cup.body.isSleeping).to.equal(true)
    expect(cup.body.linearVelocity.magnitude).to.equal(0)
    expect(cup.entity.translation.z).to.be.within(0, 0.05)
  })
  it('allows an overhanging cup to tip and fall off the finite table', function () {
    this.timeout(15000)

    const { scene, cup } = createFixture(0.42145, 0.53)

    scene.colliders.floor = new Plane()

    for (let frame = 0; frame < 300; frame++) {
      scene.update(1 / 60)
    }

    expect(cup.entity.translation.y).to.be.lessThan(0.1)
    expect(cup.entity.translation.x).to.be.greaterThan(0.40145)
  })
})
