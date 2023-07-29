import { expect } from 'chai'
import 'mocha'

import { vec3 } from '@luz/vectors'

import { Transform } from '../../../src/transform'
import { Cuboid } from '../../../src/colliders/cuboid'

const { origin } = Transform

describe('Cuboid', () => {

  it('should detect collision with intersecting cuboid', () => {

    const cuboid1 = new Cuboid({
      minimum: new vec3([1, 1, 0]),
      maximum: new vec3([3, 3, 1])
    })

    const cuboid2 = new Cuboid({
      minimum: new vec3([2, 2, 0]),
      maximum: new vec3([4, 4, 1])
    })

    const collision = cuboid1.collide(cuboid2, origin, origin)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([2, 2, 0]))
    expect(collision!.normal).to.deep.equal(new vec3([0, 0, 1]))
    expect(collision!.distance).to.equal(-1)

  })

  it('should not detect collision with non-intersecting cuboid', () => {

    const cuboid1 = new Cuboid({
      minimum: new vec3([1, 1, 0]),
      maximum: new vec3([3, 3, 1])
    })

    const cuboid2 = new Cuboid({
      minimum: new vec3([5, 5, 5]),
      maximum: new vec3([6, 6, 6])
    })

    const collision = cuboid1.collide(cuboid2, origin, origin)

    expect(collision).to.be.null

  })

})
