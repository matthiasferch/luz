import { expect } from 'chai'
import { Vector3 } from '@luz/math'
import * as physics from '@luz/physics'
import type { Collider, Collision } from '@luz/physics'

const firstOrigin = new Vector3([0, 0, 0])
const secondOrigin = new Vector3([0, 1.5, 0])
const sphere = new physics.Sphere({ origin: firstOrigin })
const cuboid = new physics.Cuboid({ origin: firstOrigin })
const ellipsoid = new physics.Ellipsoid({ origin: firstOrigin })
const cylinder = new physics.Cylinder({ origin: firstOrigin, height: 2 })
const otherSphere = new physics.Sphere({ origin: secondOrigin })
const otherCuboid = new physics.Cuboid({ origin: secondOrigin })
const otherEllipsoid = new physics.Ellipsoid({ origin: secondOrigin })
const otherCylinder = new physics.Cylinder({ origin: secondOrigin, height: 2 })
const plane = new physics.Plane({ distance: 1 })
const polygon = new physics.Polygon({
  vertices: [new Vector3([-4, 1, -4]), new Vector3([0, 1, 4]), new Vector3([4, 1, -4])]
})

interface PairFixture {
  firstCollider: Collider
  secondCollider: Collider
  collide(): Collision[] | null
}

const createFixture = <First extends Collider, Second extends Collider>(
  firstCollider: First,
  secondCollider: Second,
  collide: (firstCollider: First, secondCollider: Second) => Collision[] | null
): PairFixture => ({ firstCollider, secondCollider, collide: () => collide(firstCollider, secondCollider) })

describe('Contact contracts', () => {
  const fixtures = [
    createFixture(plane, otherSphere, physics.collidePlaneWithSphere),
    createFixture(plane, otherCuboid, physics.collidePlaneWithCuboid),
    createFixture(plane, otherEllipsoid, physics.collidePlaneWithEllipsoid),
    createFixture(plane, otherCylinder, physics.collidePlaneWithCylinder),
    createFixture(polygon, otherSphere, physics.collidePolygonWithSphere),
    createFixture(polygon, otherCuboid, physics.collidePolygonWithCuboid),
    createFixture(polygon, otherEllipsoid, physics.collidePolygonWithEllipsoid),
    createFixture(polygon, otherCylinder, physics.collidePolygonWithCylinder),
    createFixture(sphere, otherSphere, physics.collideSphereWithSphere),
    createFixture(sphere, otherCuboid, physics.collideSphereWithCuboid),
    createFixture(sphere, otherEllipsoid, physics.collideSphereWithEllipsoid),
    createFixture(sphere, otherCylinder, physics.collideSphereWithCylinder),
    createFixture(cuboid, otherCuboid, physics.collideCuboidWithCuboid),
    createFixture(cylinder, otherCuboid, physics.collideCylinderWithCuboid),
    createFixture(ellipsoid, otherCuboid, physics.collideEllipsoidWithCuboid),
    createFixture(ellipsoid, otherCylinder, physics.collideEllipsoidWithCylinder),
    createFixture(ellipsoid, otherEllipsoid, physics.collideEllipsoidWithEllipsoid),
    createFixture(cylinder, otherCylinder, physics.collideCylinderWithCylinder)
  ]
  const dispatcher = new physics.CollisionDispatcher()

  it('covers every registered pair', () => {
    expect(
      fixtures.map(({ firstCollider, secondCollider }) => `${firstCollider.type}-${secondCollider.type}`).sort()
    ).to.deep.equal([...dispatcher.supportedPairs].sort())
  })

  for (const fixture of fixtures) {
    const { firstCollider, secondCollider } = fixture

    it(`${firstCollider.type}/${secondCollider.type} uses first-to-second normals in raw and dispatched contacts`, () => {
      const contacts = fixture.collide()!
      const forward = dispatcher.detectCollisions(firstCollider, secondCollider)!
      const reverse = dispatcher.detectCollisions(secondCollider, firstCollider)!

      expect(contacts.length).to.be.greaterThan(0)
      expect(forward.length).to.equal(contacts.length)
      expect(reverse.length).to.be.greaterThan(0)

      for (const [index, contact] of contacts.entries()) {
        expect(contact.normal.y).to.be.greaterThan(0.99)
        expect(contact.normal.magnitude).to.be.closeTo(1, 1e-5)
        expect(contact.penetrationDepth).to.be.closeTo(0.5, 1e-4)
        expect(Array.from(contact.point).every(Number.isFinite)).to.equal(true)
        expect(contact).not.to.have.any.keys('contact', 'distance')
        expect(Vector3.subtract(contact.normal, forward[index].normal).magnitude).to.be.lessThan(1e-6)
      }

      for (const contact of reverse) {
        expect(contact.normal.y).to.be.lessThan(-0.99)
        expect(contact.penetrationDepth).to.be.closeTo(0.5, 1e-4)
      }
    })
  }
})
