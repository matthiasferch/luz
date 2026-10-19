import { expect } from 'chai'
import { BoundingBox, Light, Transform } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import { Cuboid, Cylinder, Ellipsoid, Plane, Polygon, Ray, Sphere, calculateColliderBoundingBox } from '@luz/physics'

describe('Collider bounding boxes', () => {
  for (const volume of [
    new Sphere({ origin: new Vector3([0.5, -1, 2]), radius: 1.7 }),
    new Cuboid({ extents: new Vector3([1, 2, 3]) }),
    new Ellipsoid({ radius: new Vector3([3, 1, 2]) }),
    ...[0, 1, 2].map((axisIndex) => new Cylinder({ radius: 1.5, height: 5, axisIndex }))
  ]) {
    it(`returns a core bounding box enclosing a translated and rotated ${volume.type}${volume instanceof Cylinder ? ` on axis ${volume.axisIndex}` : ''}`, () => {
      const transform = new Transform({
        translation: new Vector3([4, -3, 2]),
        rotation: Quaternion.setFromEulerAngles(0.4, 0.7, 0.3)
      })

      volume.applyTransform(transform)

      const boundingBox = calculateColliderBoundingBox(volume)

      expect(boundingBox).to.be.instanceOf(BoundingBox)

      for (let axis = 0; axis < 3; axis++) {
        const direction = Vector3.createAxes()[axis]
        const positiveSupport = volume.calculateSupportPoint(direction)
        const negativeSupport = volume.calculateSupportPoint(Vector3.scale(direction, -1))

        expect(boundingBox.minimum[axis]).to.be.closeTo(negativeSupport[axis], 1e-5)
        expect(boundingBox.maximum[axis]).to.be.closeTo(positiveSupport[axis], 1e-5)
      }

      for (let index = 0; index < 16; index++) {
        const point = volume.calculateSupportPoint(new Vector3([Math.cos(index), Math.sin(index), Math.cos(index * 2)]))

        for (let axis = 0; axis < 3; axis++) {
          expect(point[axis]).to.be.within(boundingBox.minimum[axis] - 1e-5, boundingBox.maximum[axis] + 1e-5)
        }
      }
    })
  }

  it('bounds polygon vertices and uses zero bounds for an empty polygon', () => {
    const polygon = new Polygon({
      vertices: [new Vector3([2, -1, 3]), new Vector3([6, -1, 3]), new Vector3([2, -1, 8])]
    })
    const boundingBox = calculateColliderBoundingBox(polygon)
    const emptyBoundingBox = calculateColliderBoundingBox(new Polygon())

    expect(boundingBox).to.be.instanceOf(BoundingBox)
    expect(boundingBox.minimum.xyz).to.deep.equal([2, -1, 3])
    expect(boundingBox.maximum.xyz).to.deep.equal([6, -1, 8])
    expect(emptyBoundingBox.minimum.xyz).to.deep.equal([0, 0, 0])
    expect(emptyBoundingBox.maximum.xyz).to.deep.equal([0, 0, 0])
  })
  it('rejects infinite colliders instead of returning finite bounds', () => {
    for (const collider of [new Plane(), new Ray()]) {
      expect(() => calculateColliderBoundingBox(collider)).to.throw(
        `Not implemented for collider type: ${collider.type}`
      )
    }
  })
  it('shares the same box representation and intersection checks with lights', () => {
    const light = new Light()
    const transform = new Transform({ translation: new Vector3([2, 3, 4]) })

    light.update(transform, 0)

    const boundingBox = light.boundingBox!
    const expectedBoundingBox = new BoundingBox(light.shadowCamera.frustum.calculateVertices())
    const sphere = new Sphere({ origin: light.shadowCamera.frustum.center.clone() })

    expect(boundingBox).to.be.instanceOf(BoundingBox)
    expect(boundingBox.minimum.xyz).to.deep.equal(expectedBoundingBox.minimum.xyz)
    expect(boundingBox.maximum.xyz).to.deep.equal(expectedBoundingBox.maximum.xyz)
    expect(BoundingBox.intersects(boundingBox, calculateColliderBoundingBox(sphere))).to.equal(true)
    expect(light.shadowCamera.frustum.intersectsBoundingBox(calculateColliderBoundingBox(sphere))).to.equal(true)
  })
})
