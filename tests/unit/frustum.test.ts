import { expect } from 'chai'
import { Vector3 } from '@luz/math'
import { Transform, Frustum } from '@luz/core'
import { Sphere, calculateColliderBoundingBox } from '@luz/physics'

describe('Culling: AABB vs Frustum', () => {
  it('AABB inside default camera frustum should intersect', () => {
    const cameraTransform = new Transform()

    cameraTransform.update(0)

    const frustum = new Frustum()

    frustum.fieldOfView = 90
    frustum.aspect = 1.0
    frustum.clipPlanes.x = 1.0
    frustum.clipPlanes.y = 100.0

    frustum.applyTransform(cameraTransform)

    const sphere = new Sphere({ origin: new Vector3([0, 0, 0]), radius: 1 })
    const sphereTransform = new Transform({ translation: new Vector3([0, 0, -5]) })

    sphere.applyTransform(sphereTransform)

    const axisAlignedBoundingBox = calculateColliderBoundingBox(sphere)

    const doesIntersect = frustum.intersectsBoundingBox(axisAlignedBoundingBox)

    if (!doesIntersect) {
      const planes = frustum.calculatePlanes()
      const minimum = axisAlignedBoundingBox.minimum
      const maximum = axisAlignedBoundingBox.maximum
      const distances = planes.map((plane) => {
        const positiveVertex = new Vector3([
          plane.normal.x >= 0 ? maximum.x : minimum.x,
          plane.normal.y >= 0 ? maximum.y : minimum.y,
          plane.normal.z >= 0 ? maximum.z : minimum.z
        ])

        return {
          normal: plane.normal.xyz,
          distance: plane.distance,
          positiveVertex: positiveVertex.xyz,
          signedDistance: Vector3.calculateDotProduct(plane.normal, positiveVertex) + plane.distance
        }
      })
      const doesIntersect = distances.every(({ signedDistance }) => signedDistance >= 0)

      // eslint-disable-next-line no-console
      console.log('Debug distances', JSON.stringify(distances), 'computed=', doesIntersect)
    }

    expect(doesIntersect).to.equal(true)
  })
  it('AABB behind camera should be culled', () => {
    const cameraTransform = new Transform()

    cameraTransform.update(0)

    const frustum = new Frustum()

    frustum.fieldOfView = 90
    frustum.aspect = 1.0
    frustum.clipPlanes.x = 1.0
    frustum.clipPlanes.y = 100.0

    frustum.applyTransform(cameraTransform)

    const sphere = new Sphere({ origin: new Vector3([0, 0, 0]), radius: 1 })
    const sphereTransform = new Transform({ translation: new Vector3([0, 0, 5]) })

    sphere.applyTransform(sphereTransform)

    const axisAlignedBoundingBox = calculateColliderBoundingBox(sphere)
    const doesIntersect = frustum.intersectsBoundingBox(axisAlignedBoundingBox)

    expect(doesIntersect).to.equal(false)
  })
})
