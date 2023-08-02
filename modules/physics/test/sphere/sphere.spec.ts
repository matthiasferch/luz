import { expect } from 'chai'
import 'mocha'

import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'

import { Sphere } from '../../src/colliders/sphere'

const { origin } = Transform

describe('Sphere', () => {

  it('should detect collision with intersecting sphere', () => {

    const sphere1 = new Sphere({
      center: new vec3([0, 0, 0]),
      radius: 1
    })

    const sphere2 = new Sphere({
      center: new vec3([0, 2, 0]),
      radius: 1
    })

    const collision = sphere1.collide(sphere2, origin, origin)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([0, 1, 0]))
    expect(collision!.normal).to.deep.equal(new vec3([0, 1, 0]))
    expect(collision!.distance).to.equal(0)

  })

  it('should not detect collision with non-intersecting sphere', () => {

    const sphere1 = new Sphere({
      center: new vec3([0, 0, 0]),
      radius: 1
    })

    const sphere2 = new Sphere({
      center: new vec3([5, 0, 0]),
      radius: 1
    })

    const collision = sphere1.collide(sphere2, origin, origin)

    expect(collision).to.be.null

  })

})
