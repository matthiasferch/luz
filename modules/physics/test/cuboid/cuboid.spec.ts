import { expect } from 'chai'
import 'mocha'

import { vec3 } from '@luz/vectors'

import { Cuboid } from '../../src/colliders/cuboid'

describe('Cuboid', () => {

  it('should detect collision with intersecting cuboid', () => {
    const cuboid1 = new Cuboid({
      center: new vec3([2, 2, 0]),
      extents: new vec3([1, 1, 1])
    })

    const cuboid2 = new Cuboid({
      center: new vec3([3, 3, 0]),
      extents: new vec3([1, 1, 1])
    })

    const collision = cuboid1.collide(cuboid2)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([3, 2, 0]))
    expect(collision!.normal).to.deep.equal(new vec3([1, 0, 0]))
    expect(collision!.distance).to.equal(-1)

  })

  it('should not detect collision with non-intersecting cuboid', () => {

    const cuboid1 = new Cuboid({
      center: new vec3([2, 2, 0.5]),
      extents: new vec3([1, 1, 0.5])
    })

    const cuboid2 = new Cuboid({
      center: new vec3([5.5, 5.5, 5.5]),
      extents: new vec3([0.5, 0.5, 0.5])
    })

    const collision = cuboid1.collide(cuboid2)

    expect(collision).to.be.null

  })

})
