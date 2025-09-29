// @ts-nocheck
import {
  Plane,
  Sphere,
  collidePlaneWithSphere,
  Cuboid,
  collidePlaneWithCuboid,
  Polygon,
  collideSphereWithCuboid,
  collidePolygonWithCuboid,
  collidePolygonWithSphere,
  collideSphereWithSphere,
  collideRayWithPlane,
  Ray,
  collideRayWithSphere,
  collideRayWithCuboid
} from '@luz/physics'
import { vec3 } from '@luz/vectors'
import { expect } from 'chai'

describe('Physics: Collisions', () => {
  describe('collideRayWithPlane', () => {
    it('should detect collision when ray intersects plane', () => {
      const ray = new Ray({
        origin: new vec3([0, 1, 0]),
        direction: vec3.down
      })

      const plane = new Plane({
        normal: vec3.up,
        distance: 0
      })

      const collision = collideRayWithPlane(ray, plane)

      expect(collision).to.not.be.null
      expect(collision.distance).to.equal(1)
      expect(collision.contact.xyz).to.deep.equal(vec3.zero.xyz)
      expect(collision.normal.xyz).to.deep.equal(vec3.up.xyz)
    })

    it('should not detect collision when ray is parallel to plane', () => {
      const ray = new Ray({
        origin: new vec3([0, 1, 0]),
        direction: vec3.forward
      })

      const plane = new Plane({
        normal: vec3.up,
        distance: 0
      })

      const collision = collideRayWithPlane(ray, plane)

      expect(collision).to.be.null
    })
  })

  describe('collideRayWithSphere', () => {
    it('should detect collision when ray intersects sphere', () => {
      const ray = new Ray({
        origin: new vec3([0, 0, 0]),
        direction: vec3.up
      })

      const sphere = new Sphere({
        origin: new vec3([0, 2, 0]),
        radius: 1
      })

      const collision = collideRayWithSphere(ray, sphere)

      expect(collision).to.not.be.null
      expect(collision.distance).to.equal(1)
      expect(collision.normal.xyz).to.deep.equal(vec3.up.xyz)
      expect(collision.contact.xyz).to.deep.equal(new vec3([0, 1, 0]).xyz)
    })

    it('should not detect collision when ray is parallel to sphere', () => {
      const ray = new Ray({
        origin: new vec3([0, 0, 0]),
        direction: vec3.forward
      })

      const sphere = new Sphere({
        origin: new vec3([2, 0, 0]),
        radius: 1
      })

      const collision = collideRayWithSphere(ray, sphere)

      expect(collision).to.be.null
    })
  })

  describe('collideRayWithCuboid', () => {
    it('should detect collision when ray intersects cuboid', () => {
      const ray = new Ray({
        origin: new vec3([0, 0, 0]),
        direction: vec3.up
      })

      const cuboid = new Cuboid({
        origin: new vec3([0, 2, 0]),
        extents: new vec3([1, 1, 1])
      })

      const collision = collideRayWithCuboid(ray, cuboid)

      expect(collision).to.not.be.null
      expect(collision.distance).to.equal(1)
      expect(collision.normal.xyz).to.deep.equal(vec3.up.xyz)
      expect(collision.contact.xyz).to.deep.equal(new vec3([0, 1, 0]).xyz)
    })

    it('should not detect collision when ray is parallel to cuboid', () => {
      const ray = new Ray({
        origin: new vec3([0, 0, 0]),
        direction: vec3.forward
      })

      const cuboid = new Cuboid({
        origin: new vec3([2, 0, 0]),
        extents: new vec3([1, 1, 1])
      })

      const collision = collideRayWithCuboid(ray, cuboid)

      expect(collision).to.be.null
    })
  })

  describe('collidePlaneWithSphere', () => {
    it('should detect collision when sphere is on plane', () => {
      const plane = new Plane({
        normal: vec3.up,
        distance: 0
      })

      const sphere = new Sphere({
        origin: new vec3([0, 1, 0]),
        radius: 1
      })

      const collisions = collidePlaneWithSphere(plane, sphere)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].distance).to.equal(0)
      expect(collisions[0].normal.xyz).to.deep.equal(vec3.up.xyz)
      expect(collisions[0].contact.xyz).to.deep.equal(vec3.zero.xyz)
    })

    it('should not detect collision when sphere is above plane', () => {
      const plane = new Plane({
        normal: vec3.up,
        distance: 0
      })

      const sphere = new Sphere({
        origin: new vec3([0, 3, 0]),
        radius: 1
      })

      const collisions = collidePlaneWithSphere(plane, sphere)

      expect(collisions).to.be.null
    })

    it('should detect collision when sphere is below plane', () => {
      const plane = new Plane({
        normal: vec3.up,
        distance: 0
      })

      const sphere = new Sphere({
        origin: new vec3([0, -1, 0]),
        radius: 1
      })

      const collisions = collidePlaneWithSphere(plane, sphere)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].distance).to.equal(0)
      expect(collisions[0].normal.xyz).to.deep.equal(vec3.up.xyz)
      expect(collisions[0].contact.xyz).to.deep.equal(new vec3([0, 0, 0]).xyz)
    })
  })

  describe('collidePlaneWithCuboid', () => {
    it('should detect collision when cuboid is on plane', () => {
      const plane = new Plane({
        normal: vec3.up,
        distance: 0
      })

      const cuboid = new Cuboid({
        origin: new vec3([0, 1, 0]),
        extents: new vec3([1, 1, 1])
      })

      const collisions = collidePlaneWithCuboid(plane, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(4)

      collisions.forEach((collision) => {
        expect(collision.distance).to.equal(0)
        expect(collision.normal.xyz).to.deep.equal(vec3.up.xyz)
      })

      const contacts = collisions.map(({ contact }) => contact)

      expect(contacts[0].xyz).to.deep.equal(new vec3([1, 0, 1]).xyz)
      expect(contacts[1].xyz).to.deep.equal(new vec3([1, 0, -1]).xyz)
      expect(contacts[2].xyz).to.deep.equal(new vec3([-1, 0, 1]).xyz)
      expect(contacts[3].xyz).to.deep.equal(new vec3([-1, 0, -1]).xyz)
    })

    it('should not detect collision when cuboid is above plane', () => {
      const plane = new Plane({
        normal: vec3.up,
        distance: 0
      })

      const cuboid = new Cuboid({
        origin: new vec3([0, 3, 0]),
        extents: new vec3([1, 1, 1])
      })

      const collisions = collidePlaneWithCuboid(plane, cuboid)

      expect(collisions).to.be.null
    })

    it('should detect collision when cuboid is below plane', () => {
      const plane = new Plane({
        normal: vec3.up,
        distance: 0
      })

      const cuboid = new Cuboid({
        origin: new vec3([0, -1, 0]),
        extents: new vec3([1, 1, 1])
      })

      const collisions = collidePlaneWithCuboid(plane, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(8)

      collisions.forEach((collision) => {
        expect(collision.normal.xyz).to.deep.equal(vec3.up.xyz)
      })

      const topCollisions = collisions.filter(({ distance }) => {
        return distance === 0
      })

      expect(topCollisions).to.have.lengthOf(4)

      const topContacts = topCollisions.map(({ contact }) => contact)

      expect(topContacts[0].xyz).to.deep.equal(new vec3([1, 0, 1]).xyz)
      expect(topContacts[1].xyz).to.deep.equal(new vec3([1, 0, -1]).xyz)
      expect(topContacts[2].xyz).to.deep.equal(new vec3([-1, 0, 1]).xyz)
      expect(topContacts[3].xyz).to.deep.equal(new vec3([-1, 0, -1]).xyz)

      const bottomCollisions = collisions.filter(({ distance }) => {
        return distance === 2
      })

      expect(bottomCollisions).to.have.lengthOf(4)

      const bottomContacts = bottomCollisions.map(({ contact }) => contact)

      expect(bottomContacts[0].xyz).to.deep.equal(new vec3([1, -2, 1]).xyz)
      expect(bottomContacts[1].xyz).to.deep.equal(new vec3([1, -2, -1]).xyz)
      expect(bottomContacts[2].xyz).to.deep.equal(new vec3([-1, -2, 1]).xyz)
      expect(bottomContacts[3].xyz).to.deep.equal(new vec3([-1, -2, -1]).xyz)
    })
  })

  describe('collidePolygonWithSphere', () => {
    it('should detect collision when sphere is on polygon', () => {
      const polygon = new Polygon({
        vertices: [new vec3([-1, 0, -1]), new vec3([0, 0, 1]), new vec3([1, 0, -1])]
      })

      const sphere = new Sphere({
        origin: new vec3([0, 1, 0]),
        radius: 1
      })

      const collisions = collidePolygonWithSphere(polygon, sphere)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].contact.xyz).to.deep.equal(vec3.zero.xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(vec3.up.xyz)
      expect(collisions[0].distance).to.equal(0)
    })

    it('should detect collision when spheres are centered around polygon vertices', () => {
      const polygon = new Polygon({
        vertices: [new vec3([-1, 0, -1]), new vec3([0, 0, 1]), new vec3([1, 0, -1])]
      })

      polygon.vertices.forEach((vertex) => {
        const sphere = new Sphere({
          origin: vertex,
          radius: 1
        })

        const collisions = collidePolygonWithSphere(polygon, sphere)

        expect(collisions).to.not.be.null
        expect(collisions).to.have.lengthOf(1)

        expect(collisions[0].contact.xyz).to.deep.equal(vertex.xyz)
        expect(collisions[0].normal.xyz).to.deep.equal(vec3.up.xyz)
        expect(collisions[0].distance).to.equal(1)
      })
    })

    it('should not detect collision when sphere is above polygon', () => {
      const polygon = new Polygon({
        vertices: [new vec3([-1, 0, -1]), new vec3([0, 0, 1]), new vec3([1, 0, -1])]
      })

      const sphere = new Sphere({
        origin: new vec3([0, 3, 0]),
        radius: 1
      })

      const collisions = collidePolygonWithSphere(polygon, sphere)

      expect(collisions).to.be.null
    })

    it('should detect collision when sphere is below polygon', () => {
      const polygon = new Polygon({
        vertices: [new vec3([-1, 0, -1]), new vec3([0, 0, 1]), new vec3([1, 0, -1])]
      })

      const sphere = new Sphere({
        origin: new vec3([0, -1, 0]),
        radius: 1
      })

      const collisions = collidePolygonWithSphere(polygon, sphere)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].contact.xyz).to.deep.equal(new vec3([0, 0, 0]).xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(vec3.up.xyz)
      expect(collisions[0].distance).to.equal(0)
    })
  })

  describe('collidePolygonWithCuboid', () => {
    it('should detect collision when cuboid is on polygon', () => {
      const polygon = new Polygon({
        vertices: [new vec3([-1, 0, -1]), new vec3([0, 0, 1]), new vec3([1, 0, -1])]
      })

      const cuboid = new Cuboid({
        origin: new vec3([0, 1, 0]),
        extents: new vec3([1, 1, 1])
      })

      const collisions = collidePolygonWithCuboid(polygon, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(4)

      collisions.forEach((collision) => {
        expect(collision.distance).to.equal(0)
        expect(collision.normal.xyz).to.deep.equal(vec3.up.xyz)
      })

      const contacts = collisions.map(({ contact }) => contact)

      expect(contacts[0].xyz).to.deep.equal(new vec3([1, 0, 1]).xyz)
      expect(contacts[1].xyz).to.deep.equal(new vec3([1, 0, -1]).xyz)
      expect(contacts[2].xyz).to.deep.equal(new vec3([-1, 0, 1]).xyz)
      expect(contacts[3].xyz).to.deep.equal(new vec3([-1, 0, -1]).xyz)
    })

    it('should not detect collision when cuboid is above polygon', () => {
      const polygon = new Polygon({
        vertices: [new vec3([-1, 0, -1]), new vec3([0, 0, 1]), new vec3([1, 0, -1])]
      })

      const cuboid = new Cuboid({
        origin: new vec3([0, 3, 0]),
        extents: new vec3([1, 1, 1])
      })

      const collisions = collidePolygonWithCuboid(polygon, cuboid)

      expect(collisions).to.be.null
    })

    it('should detect collision when cuboid is below polygon', () => {
      const polygon = new Polygon({
        vertices: [new vec3([-1, 0, -1]), new vec3([0, 0, 1]), new vec3([1, 0, -1])]
      })

      const cuboid = new Cuboid({
        origin: new vec3([0, -1, 0]),
        extents: new vec3([1, 1, 1])
      })

      const collisions = collidePolygonWithCuboid(polygon, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(4)

      collisions.forEach((collision) => {
        expect(collision.normal.xyz).to.deep.equal(vec3.up.xyz)
      })

      const contacts = collisions.map(({ contact }) => contact)

      expect(contacts[0].xyz).to.deep.equal(new vec3([1, 0, 1]).xyz)
      expect(contacts[1].xyz).to.deep.equal(new vec3([1, 0, -1]).xyz)
      expect(contacts[2].xyz).to.deep.equal(new vec3([-1, 0, 1]).xyz)
      expect(contacts[3].xyz).to.deep.equal(new vec3([-1, 0, -1]).xyz)
    })
  })

  describe('collideSphereWithCuboid', () => {
    it('should detect collision when sphere is on cuboid', () => {
      const cuboid = new Cuboid({
        origin: new vec3([0, 0, 0]),
        extents: new vec3([1, 1, 1])
      })

      const sphere = new Sphere({
        origin: new vec3([0, 2, 0]),
        radius: 1
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].contact.xyz).to.deep.equal(new vec3([0, 1, 0]).xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(vec3.up.xyz)
      expect(collisions[0].distance).to.equal(0)
    })

    it('should not detect collision when sphere is above cuboid', () => {
      const cuboid = new Cuboid({
        origin: new vec3([0, 0, 0]),
        extents: new vec3([1, 1, 1])
      })

      const sphere = new Sphere({
        origin: new vec3([0, 3, 0]),
        radius: 1
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      expect(collisions).to.be.null
    })

    it('should detect collision when sphere is below cuboid', () => {
      const cuboid = new Cuboid({
        origin: new vec3([0, 0, 0]),
        extents: new vec3([1, 1, 1])
      })

      const sphere = new Sphere({
        origin: new vec3([0, -2, 0]),
        radius: 1
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].contact.xyz).to.deep.equal(new vec3([0, -1, 0]).xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(vec3.down.xyz)
      expect(collisions[0].distance).to.equal(0)
    })

    it('should detect collision when sphere is beside cuboid along x axis', () => {
      const cuboid = new Cuboid({
        origin: new vec3([0, 0, 0]),
        extents: new vec3([1, 2, 3])
      })

      const sphere = new Sphere({
        origin: new vec3([2, 0.5, -0.75]),
        radius: 1
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].contact.xyz).to.deep.equal(new vec3([1, 0.5, -0.75]).xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(vec3.right.xyz)
      expect(collisions[0].distance).to.equal(0)
    })

    it('should detect collision when sphere grazes a cuboid corner', () => {
      const cuboid = new Cuboid({
        origin: new vec3([0, 0, 0]),
        extents: new vec3([1, 1, 1])
      })

      const radius = Math.sqrt(0.5)

      const sphere = new Sphere({
        origin: new vec3([1.5, 1.5, 0]),
        radius
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].contact.xyz).to.deep.equal(new vec3([1, 1, 0]).xyz)

      const expectedNormal = vec3.normalize(new vec3([1, 1, 0]))
      expect(collisions[0].normal.xyz).to.deep.equal(expectedNormal.xyz)
      expect(collisions[0].distance).to.be.closeTo(0, 1e-6)
    })


    it('should resolve a falling sphere against a stationary cuboid without sinking', () => {
      const cuboid = new Cuboid({
        origin: new vec3([0, 0, 0]),
        extents: new vec3([10, 1, 10])
      })

      const sphere = new Sphere({
        origin: new vec3([0, 10, 0]),
        radius: 1
      })

      const velocity = vec3.zero.copy()
      const gravity = new vec3([0, -9.81, 0])
      const delta = 1 / 60

      for (let i = 0; i < 240; i++) {
        vec3.add(velocity, vec3.scale(gravity, delta, new vec3()), velocity)
        vec3.add(sphere.center, vec3.scale(velocity, delta, new vec3()), sphere.center)

        const collisions = collideSphereWithCuboid(sphere, cuboid)

        if (collisions && collisions.length > 0) {
          const { normal, distance } = collisions[0]

          vec3.add(sphere.center, vec3.scale(normal, distance, new vec3()), sphere.center)

          const normalVelocity = vec3.dot(velocity, normal)

          if (normalVelocity < 0) {
            vec3.add(velocity, vec3.scale(normal, -normalVelocity, new vec3()), velocity)
          }
        }
      }

      expect(sphere.center.y).to.be.greaterThanOrEqual(cuboid.extents.y + sphere.radius - 1e-4)
    })

    it('should detect collision when sphere center is inside cuboid', () => {
      const cuboid = new Cuboid({
        origin: new vec3([0, 0, 0]),
        extents: new vec3([1, 1, 1])
      })

      const sphere = new Sphere({
        origin: new vec3([0.2, -0.3, 0.4]),
        radius: 0.6
      })

      const collisions = collideSphereWithCuboid(sphere, cuboid)

      expect(collisions).to.not.be.null
      expect(collisions).to.have.lengthOf(1)

      expect(collisions[0].contact.xyz).to.deep.equal(new vec3([0.2, -0.3, 1]).xyz)
      expect(collisions[0].normal.xyz).to.deep.equal(vec3.forward.xyz)

      const clearance = cuboid.extents.z - Math.abs(sphere.center.z - cuboid.center.z)
      const expectedPenetration = Math.max(0, sphere.radius - clearance)
      expect(collisions[0].distance).to.be.closeTo(expectedPenetration, 1e-6)
    })
  })

  describe('collideSphereWithSphere', () => {
    it('should detect collision when spheres are touching', () => {
      const s1 = new Sphere({
        origin: new vec3([0, 0, 0]),
        radius: 1
      })

      const s2 = new Sphere({
        origin: new vec3([2, 0, 0]),
        radius: 1
      })

      const collision = collideSphereWithSphere(s1, s2)

      expect(collision).to.not.be.null
      expect(collision.contact.xyz).to.deep.equal(new vec3([1, 0, 0]).xyz)
      expect(collision.normal.xyz).to.deep.equal(vec3.right.xyz)
      expect(collision.distance).to.equal(0)
    })

    it('should not detect collision when spheres are not touching', () => {
      const s1 = new Sphere({
        origin: new vec3([0, 0, 0]),
        radius: 1
      })

      const s2 = new Sphere({
        origin: new vec3([3, 0, 0]),
        radius: 1
      })

      const collision = collideSphereWithSphere(s1, s2)

      expect(collision).to.be.null
    })
  })
})
