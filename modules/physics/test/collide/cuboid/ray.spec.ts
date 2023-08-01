import { expect } from 'chai'
import 'mocha'

import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'

import { Cuboid } from '../../../src/colliders/cuboid'
import { Ray } from '../../../src/colliders/ray'

const { origin } = Transform

describe('Cuboid', () => {

  it('should detect collision with intersecting ray', () => {

    const cuboid = new Cuboid({
      minimum: new vec3([-1, -1, -1]),
      maximum: new vec3([1, 1, 1])
    })

    const ray = new Ray({
      origin: new vec3([2, 0, 0]),
      direction: new vec3([-1, 0, 0])
    })

    const collision = cuboid.collide(ray, origin, origin)

    expect(collision).to.not.be.null
    // cuboid-ray collision has no well-defined contact point!
    expect(collision!.normal).to.deep.equal(new vec3([-1, 0, 0]))
    expect(collision!.distance).to.equal(1)

  })

  it('should not detect collision with non-intersecting ray', () => {

    const cuboid = new Cuboid({
      minimum: new vec3([-1, -1, -1]),
      maximum: new vec3([1, 1, 1])
    })

    const ray = new Ray({
      origin: new vec3([2, 0, 0]),
      direction: new vec3([1, 0, 0])
    })

    const collision = cuboid.collide(ray, origin, origin)

    expect(collision).to.be.null

  })

})