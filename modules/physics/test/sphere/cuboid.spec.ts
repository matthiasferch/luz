import { expect } from 'chai'
import 'mocha'

import { vec3 } from '@luz/vectors'

import { Sphere } from '../../src/colliders/sphere'
import { Cuboid } from '../../src/colliders/cuboid'

describe('Sphere', () => {

  it('should detect collision with intersecting cuboid', () => {

    const sphere = new Sphere({
      center: new vec3([2, 0, 0]),
      radius: 1
    })

    const cuboid = new Cuboid({
      center: new vec3([0, 0, 0]),
      extents: new vec3([1, 1, 1])
    })

    const collision = sphere.collide(cuboid)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([1, 0, 0]))
    expect(collision!.normal).to.deep.equal(new vec3([-1, 0, 0]))
    expect(collision!.distance).to.equal(0)

  })

  it('should not detect collision with non-intersecting cuboid', () => {

    const sphere = new Sphere({
      center: new vec3([4, 0, 0]),
      radius: 1
    })

    const cuboid = new Cuboid({
      center: new vec3([0, 0, 0]),
      extents: new vec3([1, 1, 1])
    })

    const collision = sphere.collide(cuboid)

    expect(collision).to.be.null

  })

})
