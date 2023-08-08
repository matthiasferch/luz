import { expect } from 'chai'
import 'mocha'

import { vec3 } from '@luz/vectors'

import { Cuboid } from '../../src/colliders/cuboid'
import { Ray } from '../../src/colliders/ray'

describe('Cuboid', () => {

  it('should detect collision with intersecting ray', () => {

    const cuboid = new Cuboid({
      center: new vec3([0, 0, 0]),
      extents: new vec3([1, 1, 1])
    })

    const ray = new Ray({
      origin: new vec3([2, 0, 0]),
      direction: new vec3([-1, 0, 0])
    })

    const collision = cuboid.collide(ray)

    expect(collision).to.not.be.null
    // cuboid-ray collision has no well-defined contact point!
    expect(collision!.normal).to.deep.equal(new vec3([-1, 0, 0]))
    expect(collision!.distance).to.equal(1)

  })

  it('should not detect collision with non-intersecting ray', () => {

    const cuboid = new Cuboid({
      center: new vec3([0, 0, 0]),
      extents: new vec3([1, 1, 1])
    })

    const ray = new Ray({
      origin: new vec3([2, 0, 0]),
      direction: new vec3([1, 0, 0])
    })

    const collision = cuboid.collide(ray)

    expect(collision).to.be.null

  })

})
