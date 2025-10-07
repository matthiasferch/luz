// @ts-nocheck
import { expect } from 'chai'
import { vec3 } from '@luz/vectors'
import { Transform } from '@luz/core'
import { Sphere, culling, Frustum } from '@luz/physics'

describe('Culling: AABB vs Frustum', () => {
  it('AABB inside default camera frustum should intersect', () => {
    // Identity transform camera at origin, looking along -Z in view space
    const cameraTransform = new Transform()
    cameraTransform.update(0)

    // Construct a frustum matching default camera params
    const frustum = new Frustum({ fovY: 90, aspect: 1.0, near: 1.0, far: 100.0 })
    frustum.applyTransform(cameraTransform)

    // Place a sphere at z = -5 (inside near/far range), unit radius
    const sphere = new Sphere({ origin: new vec3([0, 0, 0]), radius: 1 })
    const sphereTransform = new Transform({ translation: new vec3([0, 0, -5]) })
    sphere.applyTransform(sphereTransform)

    const aabb = new (require('@luz/physics/broadphase').BoundingBox)(sphere)

    const result = culling.aabbIntersectsFrustum(frustum, aabb)
    if (!result) {
      const planes = frustum.getPlanes()
      const min = aabb.minimum, max = aabb.maximum
      const distances = planes.map((p) => {
        const vP = new vec3([
          p.normal.x >= 0 ? max.x : min.x,
          p.normal.y >= 0 ? max.y : min.y,
          p.normal.z >= 0 ? max.z : min.z,
        ])
        return { n: p.normal.xyz, d: p.distance, vp: vP.xyz, sd: p.signedDistance(vP) }
      })
      const computed = distances.every((x) => x.sd >= 0)
      // eslint-disable-next-line no-console
      console.log('Debug distances', JSON.stringify(distances), 'computed=', computed)
    }
    expect(result).to.equal(true)
  })

  it('AABB behind camera should be culled', () => {
    const cameraTransform = new Transform()
    cameraTransform.update(0)

    const frustum = new Frustum({ fovY: 90, aspect: 1.0, near: 1.0, far: 100.0 })
    frustum.applyTransform(cameraTransform)

    const sphere = new Sphere({ origin: new vec3([0, 0, 0]), radius: 1 })
    const sphereTransform = new Transform({ translation: new vec3([0, 0, 5]) })
    sphere.applyTransform(sphereTransform)

    const aabb = new (require('@luz/physics/broadphase').BoundingBox)(sphere)
    const result = culling.aabbIntersectsFrustum(frustum, aabb)
    expect(result).to.equal(false)
  })
})
