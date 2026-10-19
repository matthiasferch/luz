import { expect } from 'chai'
import { Transform } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import {
  Cuboid,
  Ellipsoid,
  PhysicsWorld,
  Plane,
  Ray,
  Sphere,
  intersectRayWithCuboid,
  intersectRayWithEllipsoid,
  intersectRayWithPlane,
  intersectRayWithRay,
  intersectRayWithSphere,
  raycastCollider
} from '@luz/physics'
import type { RayIntersection, Volume } from '@luz/physics'

describe('Ray intersections', () => {
  const fixtures: Array<{ name: string; volume: Volume; intersect: (ray: Ray) => RayIntersection | null }> = [
    {
      name: 'sphere',
      volume: new Sphere(),
      intersect: (ray) => intersectRayWithSphere(ray, new Sphere())
    },
    {
      name: 'cuboid',
      volume: new Cuboid(),
      intersect: (ray) => intersectRayWithCuboid(ray, new Cuboid())
    },
    {
      name: 'ellipsoid',
      volume: new Ellipsoid(),
      intersect: (ray) => intersectRayWithEllipsoid(ray, new Ellipsoid())
    }
  ]

  for (const { name, volume, intersect } of fixtures) {
    it(`${name} reports world distances and outward normals for entry and inside exits`, () => {
      for (const [origin, direction, distance, normal] of [
        [new Vector3([3, 0, 0]), new Vector3([-7, 0, 0]), 2, Vector3.createRight()],
        [Vector3.createZero(), new Vector3([7, 0, 0]), 1, Vector3.createRight()]
      ] as const) {
        const ray = new Ray({ origin, direction })

        ray.direction.scale(4)

        const hit = intersect(ray)!
        const query = raycastCollider(ray, volume)!

        expect(hit.distance).to.be.closeTo(distance, 1e-6)
        expect(hit.point.xyz).to.deep.equal([1, 0, 0])
        expect(hit.normal.xyz).to.deep.equal(normal.xyz)
        expect(query.point.xyz).to.deep.equal(hit.point.xyz)
        expect(query.normal.xyz).to.deep.equal(hit.normal.xyz)
        expect(hit).not.to.have.property('contact')
      }

      expect(intersect(new Ray({ origin: new Vector3([3, 0, 0]), direction: Vector3.createRight() }))).to.equal(null)
      expect(intersect(new Ray({ origin: new Vector3([3, 0, 0]), direction: Vector3.createUp() }))).to.equal(null)

      const invalidRay = new Ray()

      invalidRay.direction.fill(0)
      expect(() => intersect(invalidRay)).to.throw()
    })
  }

  it('rotates ellipsoid normals into world space', () => {
    const ellipsoid = new Ellipsoid({ radius: new Vector3([2, 1, 1]) })
    const rotation = Quaternion.setFromAxisAngle(Vector3.createForward(), Math.PI / 2)

    ellipsoid.applyTransform(new Transform({ rotation }))

    const hit = intersectRayWithEllipsoid(
      new Ray({ origin: new Vector3([0, 4, 0]), direction: Vector3.createDown() }),
      ellipsoid
    )!

    expect(hit.distance).to.be.closeTo(2, 1e-5)
    expect(hit.point.y).to.be.closeTo(2, 1e-5)
    expect(hit.normal.y).to.be.closeTo(1, 1e-5)
  })
  it('uses plane orientation and a documented cross-product normal for intersecting rays', () => {
    const ray = new Ray({ origin: new Vector3([0, 2, 0]), direction: Vector3.createDown() })
    const planeHit = intersectRayWithPlane(ray, new Plane())!
    const rayHit = intersectRayWithRay(
      ray,
      new Ray({ origin: new Vector3([-2, 0, 0]), direction: new Vector3([3, 0, 0]) })
    )!

    expect(planeHit.distance).to.equal(2)
    expect(planeHit.normal.xyz).to.deep.equal(Vector3.createUp().xyz)
    expect(rayHit.distance).to.equal(2)
    expect(rayHit.point.xyz).to.deep.equal([0, 0, 0])
    expect(Vector3.subtract(rayHit.normal, Vector3.createForward()).magnitude).to.be.lessThan(1e-6)
  })
  it('validates raw query limits and rays even in an empty world', () => {
    const ray = new Ray()

    for (const maximumDistance of [-1, NaN, -Infinity]) {
      expect(() => raycastCollider(ray, new Sphere(), maximumDistance)).to.throw()
      expect(() => new PhysicsWorld().raycast(ray, { maximumDistance })).to.throw()
    }

    ray.origin.x = Infinity

    expect(() => new PhysicsWorld().raycastAll(ray)).to.throw()
  })
})
