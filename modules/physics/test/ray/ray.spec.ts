import { expect } from 'chai'
import 'mocha'

import { vec3 } from '@luz/vectors'

import { Ray } from '../../src/colliders/ray'

describe('Ray', () => {

  it('should detect collision with intersecting (perpendicular) ray', () => {

    const ray1 = new Ray({
      origin: new vec3([1, 1, 0]),
      direction: new vec3([1, 0, 0])
    })

    const ray2 = new Ray({
      origin: new vec3([1, 1, 0]),
      direction: new vec3([0, 1, 0])
    })

    const collision = ray1.collide(ray2)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([1, 1, 0]))
    // expect(collision!.normal).to.deep.equal(new vec3([1, 0, 0]))
    expect(collision!.distance).to.equal(0)

  })

  it('should not detect collision with non-intersecting (parallel) ray', () => {

    const ray1 = new Ray({
      origin: new vec3([0, 1, 0]),
      direction: new vec3([1, 0, 0])
    })

    const ray2 = new Ray({
      origin: new vec3([0, 2, 0]),
      direction: new vec3([1, 0, 0])
    })

    const collisionResult = ray1.collide(ray2)

    expect(collisionResult).to.be.null

  })

})